/**
 * Factory for the course-purchase route handlers (POST /confirm and
 * POST /webhook). Extracts the shared logic from routes/payments.ts so the
 * e2e test server (apps/api/src/test-server.ts) can compose the same code
 * path with stubbed Stripe / Inngest / Prisma / auth, instead of duplicating
 * ~100 lines of route logic.
 *
 * Usage:
 *   // Real route
 *   paymentsRouter.use(createCoursePurchaseRouter({
 *     verifyPaymentSession,
 *     constructWebhookEvent,
 *     inngest,
 *     prisma,
 *     authenticate,
 *   }));
 *
 *   // Test server
 *   app.use(createCoursePurchaseRouter({
 *     verifyPaymentSession: mockVerifyPaymentSession,
 *     constructWebhookEvent: mockConstructWebhookEvent,
 *     inngest: { send: mockInngestSend },
 *     prisma,
 *     authenticate: testAuthMiddleware,
 *   }));
 *
 * The factory is intentionally pure: no top-level side effects, no module
 * imports beyond types. All collaborators are passed in.
 *
 * Note: Express handler parameter types are `any` because @types/express in
 * this project exposes `Request`/`Response`/`NextFunction` as namespaces
 * (not types), which conflicts with strict type annotations. Type safety is
 * preserved at the call sites (real route and test server) where the actual
 * Express types are used.
 */
import { Router } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.js';

// ----- Dependency types -------------------------------------------------------

export interface VerifyPaymentSessionResult {
  success: boolean;
  userId?: string;
  courseId?: string;
  paymentId?: string;
  amount?: number;
}

export type VerifyPaymentSessionFn = (sessionId: string) => Promise<VerifyPaymentSessionResult>;

export type ConstructWebhookEventFn = (
  rawBody: string | Buffer,
  signature: string,
) => { type: string; data: { object: any } };

export interface InngestLike {
  // Return type is intentionally permissive (Promise<any>) so the real
  // Inngest client (which returns Promise<{ ids: string[] }>) and the test
  // mock (which returns Promise<void>) both satisfy the interface.
  send: (event: { name: string; id?: string; data: any }) => Promise<any>;
}

export type AuthMiddleware = (req: any, res: any, next: any) => void | Promise<void>;

export interface CoursePurchaseHandlerDeps {
  verifyPaymentSession: VerifyPaymentSessionFn;
  constructWebhookEvent: ConstructWebhookEventFn;
  inngest: InngestLike;
  prisma: PrismaClient;
  authenticate: AuthMiddleware;
  /** Override the Inngest event name. Default: 'stripe/checkout.session.completed' */
  eventName?: string;
}

// ----- Helpers ----------------------------------------------------------------

/**
 * Atomic create-or-update for CoursePurchase. If the (userId, courseId) unique
 * constraint fires (P2002), falls through to an idempotent update. Returns
 * `{ purchase, isNewPurchase }` so the caller can gate side effects (e.g.
 * Inngest dispatch) on whether this is the first write.
 */
async function createOrUpdatePurchase(
  prisma: PrismaClient,
  userId: string,
  courseId: string,
  stripePaymentId: string,
  amountPaid: number,
) {
  try {
    const purchase = await prisma.coursePurchase.create({
      data: { userId, courseId, stripePaymentId, amountPaid },
    });
    return { purchase, isNewPurchase: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const purchase = await prisma.coursePurchase.update({
        where: { userId_courseId: { userId, courseId } },
        data: { stripePaymentId, amountPaid, purchasedAt: new Date() },
      });
      return { purchase, isNewPurchase: false };
    }
    throw err;
  }
}

function errorResponse(res: any, err: unknown) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }
  console.error('[createCoursePurchaseRouter] unexpected error:', err);
  return res.status(500).json({ status: 'error', message: 'Internal server error' });
}

// ----- Factory ----------------------------------------------------------------

export function createCoursePurchaseRouter(deps: CoursePurchaseHandlerDeps) {
  const {
    verifyPaymentSession,
    constructWebhookEvent,
    inngest,
    prisma,
    authenticate,
    eventName = 'stripe/checkout.session.completed',
  } = deps;

  const router = Router();

  // POST /confirm — called by the frontend after Stripe redirects back.
  // Verifies the session with Stripe, enforces session ownership, then
  // atomically records the purchase + enrollment and dispatches an Inngest
  // event (only on the first write — P2002 race losers skip the dispatch).
  router.post('/confirm', authenticate, async (req: any, res: any) => {
    try {
      const { sessionId, courseId } = req.body ?? {};
      if (!sessionId || !courseId) {
        throw new AppError('Datos incompletos', 400);
      }

      const payment = await verifyPaymentSession(sessionId);
      if (!payment.success) {
        throw new AppError('El pago no fue exitoso', 400);
      }

      // Security: session must belong to the authenticated user.
      if (!payment.userId || payment.userId !== req.user!.id) {
        throw new AppError('Esta sesión de pago no pertenece a tu cuenta', 403);
      }

      const { purchase, isNewPurchase } = await createOrUpdatePurchase(
        prisma,
        req.user!.id,
        courseId,
        payment.paymentId ?? '',
        payment.amount ?? 0,
      );

      const enrollment = await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: req.user!.id, courseId } },
        update: {},
        create: { userId: req.user!.id, courseId },
      });

      if (isNewPurchase) {
        try {
          await inngest.send({
            name: eventName,
            id: `stripe-${sessionId}`,
            data: {
              userId: req.user!.id,
              courseId,
              amount: payment.amount ?? 0,
              paymentIntentId: payment.paymentId,
              isManual: false,
            },
          });
        } catch (inngestErr) {
          console.error('[INNGEST] Failed to dispatch event from /confirm:', inngestErr);
        }
      }

      return res.json({
        status: 'success',
        data: { purchased: true, purchaseId: purchase.id, enrollment },
      });
    } catch (err) {
      return errorResponse(res, err);
    }
  });

  // POST /webhook — called by Stripe after a successful checkout.
  // Verifies the signature, then atomically records the purchase +
  // enrollment and dispatches an Inngest event (only on the first write).
  // Always returns 200 to prevent Stripe retries for validation errors.
  router.post('/webhook', async (req: any, res: any) => {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.json({ received: true });
    }

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        console.error('No raw body available for webhook verification');
        return res.json({ received: true });
      }

      const event = constructWebhookEvent(rawBody, signature);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session?.payment_status === 'paid') {
            const courseId = session.metadata?.courseId;
            const userId = session.metadata?.userId;
            if (courseId && userId) {
              const { isNewPurchase } = await createOrUpdatePurchase(
                prisma,
                userId,
                courseId,
                session.payment_intent ?? '',
                session.amount_total ?? 0,
              );

              await prisma.enrollment.upsert({
                where: { userId_courseId: { userId, courseId } },
                update: {},
                create: { userId, courseId },
              });

              if (isNewPurchase) {
                try {
                  await inngest.send({
                    name: eventName,
                    id: `stripe-${session.id}`,
                    data: {
                      userId,
                      courseId,
                      amount: session.amount_total ?? 0,
                      paymentIntentId: session.payment_intent,
                      isManual: false,
                    },
                  });
                } catch (inngestErr) {
                  console.error('[INNGEST] Failed to dispatch event from /webhook:', inngestErr);
                }
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
          const paymentIntent = event.data.object;
          console.log('Payment failed:', paymentIntent?.id);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err?.message);
      // Return 200 to prevent Stripe retries for validation errors
      return res.json({ received: true });
    }
  });

  return router;
}
