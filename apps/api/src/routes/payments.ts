import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest, requireAdmin } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';
import { createCourseCheckoutSession, verifyPaymentSession, isStripeConfigured, stripe } from '../services/stripe.js';
import { sendPurchaseConfirmationEmail, isEmailConfigured } from '../services/email.js';
import { inngest } from '../services/inngest.js';

export const paymentsRouter = Router();

// Check if Stripe is configured
paymentsRouter.get('/status', (_, res) => {
  res.json({
    status: 'success',
    data: {
      stripeConfigured: isStripeConfigured(),
    },
  });
});

// Get price for a course (with user level check)
paymentsRouter.get('/course/:courseId/price', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      select: {
        id: true,
        title: true,
        isPro: true,
        price: true,
        requiredLevel: true,
      },
    });

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    // Check if user already purchased this course
    const existingPurchase = await prisma.coursePurchase.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: course.id,
        },
      },
    });

    if (existingPurchase) {
      return res.json({
        status: 'success',
        data: {
          courseId: course.id,
          isPurchased: true,
          isPro: course.isPro,
          price: 0,
          requiredLevel: course.requiredLevel,
        },
      });
    }

    // Check if user meets level requirement
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { level: true },
    });

    const meetsLevelRequirement = !course.isPro || course.requiredLevel === 0 || (user && user.level >= course.requiredLevel);

    res.json({
      status: 'success',
      data: {
        courseId: course.id,
        title: course.title,
        isPurchased: false,
        isPro: course.isPro,
        price: course.isPro ? course.price : 0, // Only show price if PRO
        requiredLevel: course.requiredLevel,
        meetsLevelRequirement,
        userLevel: user?.level || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create Stripe checkout session for course purchase
paymentsRouter.post('/course/:courseId/checkout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!isStripeConfigured()) {
      throw new AppError('Pagos no disponibles. Contacta al administrador.', 503);
    }

    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
    });

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    if (!course.isPro) {
      throw new AppError('Este curso no requiere pago', 400);
    }

    // Check if user already purchased
    const existingPurchase = await prisma.coursePurchase.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: course.id,
        },
      },
    });

    if (existingPurchase) {
      throw new AppError('Ya has purchased este curso', 400);
    }

    // Check level requirement
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { level: true, email: true },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (course.requiredLevel > 0 && user.level < course.requiredLevel) {
      throw new AppError(
        `Necesitas nivel ${course.requiredLevel} para comprar este curso. Tu nivel actual: ${user.level}`,
        403
      );
    }

    // Create Stripe checkout session
    const { url, sessionId } = await createCourseCheckoutSession({
      courseId: course.id,
      courseTitle: course.title,
      price: course.price,
      userId: req.user!.id,
      userEmail: user.email,
    });

    res.json({
      status: 'success',
      data: {
        checkoutUrl: url,
        sessionId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Handle Stripe webhook (called by Stripe after payment)
// Note: This route needs raw body parsing, handled in index.ts
paymentsRouter.post('/webhook', async (req: AuthRequest, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature || !isStripeConfigured()) {
    return res.json({ received: true });
  }

  try {
    // Use the rawBody that was stored by the json middleware's verify callback
    const rawBody = (req as any).rawBody;
    
    if (!rawBody) {
      console.error('No raw body available for webhook verification');
      return res.json({ received: true });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        if (session.payment_status === 'paid') {
          const courseId = session.metadata?.courseId;
          const userId = session.metadata?.userId;

          if (courseId && userId) {
            // Record the purchase (idempotent - using upsert)
            await prisma.coursePurchase.upsert({
              where: {
                userId_courseId: { userId, courseId },
              },
              update: {
                stripePaymentId: session.payment_intent,
                amountPaid: session.amount_total || 0,
                purchasedAt: new Date(),
              },
              create: {
                userId,
                courseId,
                stripePaymentId: session.payment_intent,
                amountPaid: session.amount_total || 0,
              },
            });

            // Auto-enroll the user in the course
            await prisma.enrollment.upsert({
              where: {
                userId_courseId: { userId, courseId },
              },
              update: {},
              create: { userId, courseId },
            });

            console.log(`✅ Purchase completed: User ${userId} purchased course ${courseId}`);

            // Dispatch Inngest event for background job processing
            try {
              await inngest.send({
                name: 'stripe/checkout.session.completed',
                data: {
                  userId,
                  courseId,
                  amount: session.amount_total || 0,
                  paymentIntentId: session.payment_intent,
                },
              });
              console.log(`[INNGEST] Event dispatched: stripe/checkout.session.completed for user ${userId}`);
            } catch (inngestErr) {
              console.error('[INNGEST] Failed to dispatch event:', inngestErr);
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        console.log('PaymentIntent succeeded:', event.data.object);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    // Return 200 to prevent Stripe retries for validation errors
    res.json({ received: true });
  }
});

// Confirm payment manually (called after successful Stripe redirect)
paymentsRouter.post('/confirm', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sessionId, courseId } = req.body;

    if (!sessionId || !courseId) {
      throw new AppError('Datos incompletos', 400);
    }

    // Verify the payment with Stripe
    const payment = await verifyPaymentSession(sessionId);

    if (!payment.success) {
      throw new AppError('El pago no fue exitoso', 400);
    }

    // Record the purchase
    const purchase = await prisma.coursePurchase.upsert({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: courseId,
        },
      },
      update: {
        stripePaymentId: payment.paymentId,
        amountPaid: payment.amount || 0,
        purchasedAt: new Date(),
      },
      create: {
        userId: req.user!.id,
        courseId: courseId,
        stripePaymentId: payment.paymentId,
        amountPaid: payment.amount || 0,
      },
    });

    // Auto-enroll the user in the course
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: courseId,
        },
      },
      update: {},
      create: {
        userId: req.user!.id,
        courseId: courseId,
      },
    });

    res.json({
      status: 'success',
      data: {
        purchased: true,
        enrollment,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get user's purchased courses
paymentsRouter.get('/purchases', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const purchases = await prisma.coursePurchase.findMany({
      where: { userId: req.user!.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            imageUrl: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: { purchases },
    });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// ADMIN WEBHOOK TEST ENDPOINTS
// ===========================================

// List recent Stripe checkout sessions (for debugging/testing)
paymentsRouter.get('/admin/sessions', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return res.json({
        status: 'success',
        data: {
          sessions: [],
          message: 'Stripe no está configurado',
        },
      });
    }

    const { limit = 20 } = req.query;

    // List recent checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: Number(limit),
    });

    res.json({
      status: 'success',
      data: {
        sessions: sessions.data.map((s) => ({
          id: s.id,
          paymentStatus: s.payment_status,
          status: s.status,
          amountTotal: s.amount_total,
          currency: s.currency,
          customerEmail: s.customer_email,
          courseId: s.metadata?.courseId,
          userId: s.metadata?.userId,
          createdAt: new Date(s.created * 1000).toISOString(),
          completedAt: s.payment_status === 'paid' ? new Date(s.payment_intent ? (s.payment_intent as any).created * 1000 : s.created * 1000).toISOString() : null,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// List all course purchases for admin
paymentsRouter.get('/admin/purchases', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const [purchases, total] = await Promise.all([
      prisma.coursePurchase.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          course: {
            select: { id: true, title: true, category: true },
          },
        },
        orderBy: { purchasedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.coursePurchase.count(),
    ]);

    res.json({
      status: 'success',
      data: {
        purchases,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Manually verify and process a purchase (for testing when webhook fails)
paymentsRouter.post('/admin/verify-purchase', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { sessionId, courseId, userId } = req.body;

    if (!sessionId && !courseId && !userId) {
      throw new AppError('Se requiere sessionId, courseId o userId', 400);
    }

    let session;
    let purchaseData: any = {};

    // If sessionId provided, verify with Stripe
    if (sessionId) {
      if (!isStripeConfigured()) {
        throw new AppError('Stripe no está configurado', 503);
      }

      session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        return res.json({
          status: 'success',
          data: {
            verified: false,
            message: 'El pago no fue completado',
            session: {
              id: session.id,
              paymentStatus: session.payment_status,
            },
          },
        });
      }

      const resolvedCourseId = courseId || session.metadata?.courseId;
      const resolvedUserId = userId || session.metadata?.userId;

      if (!resolvedCourseId || !resolvedUserId) {
        throw new AppError('No se encontró courseId o userId en los metadatos', 400);
      }

      // Record the purchase
      const purchase = await prisma.coursePurchase.upsert({
        where: {
          userId_courseId: { userId: resolvedUserId, courseId: resolvedCourseId },
        },
        update: {
          stripePaymentId: session.payment_intent as string,
          amountPaid: session.amount_total || 0,
          purchasedAt: new Date(),
        },
        create: {
          userId: resolvedUserId,
          courseId: resolvedCourseId,
          stripePaymentId: session.payment_intent as string,
          amountPaid: session.amount_total || 0,
        },
      });

      // Auto-enroll
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId: resolvedUserId, courseId: resolvedCourseId },
        },
        update: {},
        create: { userId: resolvedUserId, courseId: resolvedCourseId },
      });

      purchaseData = { purchase, enrolled: true };

      // Get user and course info for email notification
      const [userForEmail, courseForEmail] = await Promise.all([
        prisma.user.findUnique({ where: { id: resolvedUserId }, select: { name: true, email: true } }),
        prisma.course.findUnique({ where: { id: resolvedCourseId }, select: { title: true, category: true, id: true } }),
      ]);

      // Send purchase confirmation email (async - don't block if email fails)
      if (userForEmail && courseForEmail && isEmailConfigured()) {
        void sendPurchaseConfirmationEmail({
          userName: userForEmail.name,
          userEmail: userForEmail.email,
          courseTitle: courseForEmail.title,
          courseCategory: courseForEmail.category,
          courseId: courseForEmail.id,
          amountPaid: session.amount_total || 0,
          paymentId: session.payment_intent as string || session.id,
          purchaseDate: new Date().toLocaleString('es-ES'),
          isManual: false,
        }).catch((err) => console.error('Failed to send purchase email:', err));
      }
    }
    // Otherwise, manually create purchase without Stripe verification
    else if (courseId && userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        throw new AppError('Curso no encontrado', 404);
      }

      const purchase = await prisma.coursePurchase.upsert({
        where: {
          userId_courseId: { userId, courseId },
        },
        update: {
          amountPaid: course.price,
          purchasedAt: new Date(),
        },
        create: {
          userId,
          courseId,
          stripePaymentId: 'manual-test-' + Date.now(),
          amountPaid: course.price,
        },
      });

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId, courseId },
        },
        update: {},
        create: { userId, courseId },
      });

      purchaseData = { purchase, enrolled: true };

      // Send purchase confirmation email for manual verification (async - don't block if email fails)
      if (isEmailConfigured()) {
        void sendPurchaseConfirmationEmail({
          userName: user.name,
          userEmail: user.email,
          courseTitle: course.title,
          courseCategory: course.category,
          courseId: course.id,
          amountPaid: course.price,
          paymentId: 'manual-test-' + Date.now(),
          purchaseDate: new Date().toLocaleString('es-ES'),
          isManual: true,
        }).catch((err) => console.error('Failed to send purchase email:', err));
      }
    }

    res.json({
      status: 'success',
      data: {
        verified: true,
        message: sessionId ? 'Compra verificada y registrada desde Stripe' : 'Compra registrada manualmente',
        ...purchaseData,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get Stripe configuration status
paymentsRouter.get('/admin/stripe-status', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const configured = isStripeConfigured();

    res.json({
      status: 'success',
      data: {
        stripeConfigured: configured,
        webhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
      },
    });
  } catch (err) {
    next(err);
  }
});