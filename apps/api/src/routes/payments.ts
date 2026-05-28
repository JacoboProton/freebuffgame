import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';
import { createCourseCheckoutSession, verifyPaymentSession, isStripeConfigured, stripe } from '../services/stripe.js';

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