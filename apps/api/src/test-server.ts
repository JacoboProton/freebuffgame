// @ts-nocheck - Test server: relaxed type checking to keep mocks concise.
/**
 * Self-contained test API server for Playwright e2e tests.
 *
 * ⚠️  MUST stay in sync with `routes/payments.ts` POST /confirm handler.
 * Last reviewed: 2026-06-11. If you change the real route, mirror the change
 * here. The cleanest long-term fix is to refactor the real route to a
 * `createConfirmHandler({ verifyPaymentSession, inngest, authenticate })`
 * factory so the test server can compose the real handler with stubs.
 *
 * Mirrors the /payments/confirm AND /payments/webhook logic from
 * routes/payments.ts but with:
 *   - Stripe.verifyPaymentSession  → in-memory map of mock sessions
 *   - Stripe.constructWebhookEvent → plain JSON body parse (no signature)
 *   - Clerk `authenticate`         → header-based test auth (x-test-user-id)
 *   - Inngest.send                 → in-memory event recorder
 *
 * Real Prisma is used to write/read CoursePurchase + Enrollment rows so the
 * tests can assert that a purchase was actually recorded in the database.
 *
 * Atomicity: the test server mirrors the real route's try/catch create+update
 * pattern (P2002 catch) so the e2e tests exercise the same race-free code
 * path that production does.
 *
 * Started by playwright.config.ts → webServer.command before any spec runs.
 */
import express from 'express';
import cors from 'cors';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

// Safety guard: refuse to start unless explicitly enabled. Prevents accidental
// production deploys from exposing the /api/test/* write endpoints.
if (process.env.NODE_ENV !== 'test' && !process.env.ENABLE_TEST_ENDPOINTS) {
  throw new Error(
    'test-server.ts refused to start: NODE_ENV must be "test" or ENABLE_TEST_ENDPOINTS must be set',
  );
}

const app = express();
const PORT = Number(process.env.TEST_API_PORT || 3001);

app.use(cors());
app.use(express.json());

// ----- Test auth middleware ---------------------------------------------------
// In production, /payments/confirm uses the `authenticate` middleware which
// verifies a Clerk JWT or app JWT. For tests, we accept a simple header that
// the test spec sets per-request.
app.use((req, _res, next) => {
  const testUserId = req.headers['x-test-user-id'];
  if (typeof testUserId === 'string' && testUserId.length > 0) {
    req.user = {
      id: testUserId,
      email: `${testUserId}@test.local`,
      role: 'user',
    };
  }
  next();
});

// ----- Mocks ------------------------------------------------------------------
/** sessionId → { userId, courseId, amount } */
const MOCK_SESSIONS: Record<string, { userId: string; courseId: string; amount: number }> = {};
/** Recorded Inngest events (instead of calling Inngest.send) */
const inngestEvents: Array<{ name: string; id: string; data: any }> = [];

function registerMockSession(sessionId: string, userId: string, courseId: string, amount = 9900) {
  MOCK_SESSIONS[sessionId] = { userId, courseId, amount };
}

// ----- POST /api/payments/webhook (mirrors production with mocks) -------------
// Mocks Stripe signature verification: the test spec sends a plain JSON event
// body. Only the `checkout.session.completed` branch is implemented; other
// event types are no-ops (matching the real handler which logs them and
// returns 200).
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const event = req.body;
    if (event?.type !== 'checkout.session.completed') {
      return res.json({ received: true });
    }
    const session = event.data?.object;
    if (session?.payment_status !== 'paid') {
      return res.json({ received: true });
    }
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;
    if (!courseId || !userId) {
      return res.json({ received: true });
    }

    // Atomic create-or-update — same pattern as /confirm. Whichever handler
    // wins the create race sets isNewPurchase=true; the loser hits P2002 and
    // stays false. Only the winner dispatches the Inngest event, so the
    // /confirm + webhook race produces exactly 1 event (which Inngest would
    // dedupe to 1 function execution → 1 email in production).
    let isNewPurchase = false;
    try {
      await prisma.coursePurchase.create({
        data: {
          userId,
          courseId,
          stripePaymentId: session.payment_intent,
          amountPaid: session.amount_total || 0,
        },
      });
      isNewPurchase = true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        await prisma.coursePurchase.update({
          where: { userId_courseId: { userId, courseId } },
          data: {
            stripePaymentId: session.payment_intent,
            amountPaid: session.amount_total || 0,
            purchasedAt: new Date(),
          },
        });
      } else {
        throw err;
      }
    }

    // Upsert enrollment (idempotent)
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });

    // MOCK: inngest.send — same deterministic id as /confirm would use.
    if (isNewPurchase) {
      inngestEvents.push({
        name: 'stripe/checkout.session.completed',
        id: `stripe-${session.id}`,
        data: {
          userId,
          courseId,
          amount: session.amount_total || 0,
          paymentIntentId: session.payment_intent,
          isManual: false,
        },
      });
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('[/api/payments/webhook] error:', err);
    // Match real route: return 200 to prevent Stripe retries for validation errors
    return res.json({ received: true });
  }
});

// ----- POST /api/payments/confirm (mirrors production with mocks) --------------
app.post('/api/payments/confirm', async (req, res) => {
  try {
    const { sessionId, courseId } = req.body ?? {};

    if (!sessionId || !courseId) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
    }
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'No auth' });
    }

    // MOCK: verifyPaymentSession
    const mockSession = MOCK_SESSIONS[sessionId];
    const payment = mockSession
      ? {
          success: true as const,
          userId: mockSession.userId,
          courseId: mockSession.courseId,
          paymentId: `pi_mock_${sessionId}`,
          amount: mockSession.amount,
        }
      : { success: false as const };

    if (!payment.success) {
      return res.status(400).json({ status: 'error', message: 'El pago no fue exitoso' });
    }

    // Security: session must belong to authenticated user
    if (!payment.userId || payment.userId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Esta sesión de pago no pertenece a tu cuenta' });
    }

    // Atomic create-or-update — mirrors routes/payments.ts exactly: try to
    // create the purchase; if (userId, courseId) unique constraint fires
    // (P2002), fall through to an idempotent update. Eliminates the TOCTOU
    // window that findUnique + upsert would have, and keeps the e2e test
    // exercising the same code path as production.
    let purchase;
    let isNewPurchase = false;
    try {
      purchase = await prisma.coursePurchase.create({
        data: {
          userId: req.user.id,
          courseId,
          stripePaymentId: payment.paymentId,
          amountPaid: payment.amount,
        },
      });
      isNewPurchase = true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        purchase = await prisma.coursePurchase.update({
          where: { userId_courseId: { userId: req.user.id, courseId } },
          data: {
            stripePaymentId: payment.paymentId,
            amountPaid: payment.amount,
            purchasedAt: new Date(),
          },
        });
      } else {
        throw err;
      }
    }

    // Upsert enrollment (idempotent)
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      update: {},
      create: { userId: req.user.id, courseId },
    });

    // MOCK: inngest.send — only fire on the first purchase so the test can
    // assert exactly-one-event semantics (matching the deterministic id
    // dedupe that production Inngest provides).
    if (isNewPurchase) {
      inngestEvents.push({
        name: 'stripe/checkout.session.completed',
        id: `stripe-${sessionId}`,
        data: {
          userId: req.user.id,
          courseId,
          amount: payment.amount,
          paymentIntentId: payment.paymentId,
          isManual: false,
        },
      });
    }

    return res.json({
      status: 'success',
      data: { purchased: true, purchaseId: purchase.id },
    });
  } catch (err: any) {
    console.error('[/api/payments/confirm] error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// ----- Test-only endpoints ----------------------------------------------------

/** Register a test user, test course, and a mock Stripe session. */
app.post('/api/test/setup', async (req, res) => {
  try {
    const { userId, courseId, sessionId, amount, otherUserId } = req.body ?? {};
    if (!userId || !courseId || !sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, courseId, sessionId required',
      });
    }
    // Create test user (upsert so re-runs are safe)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@test.local`, name: 'Test User' },
    });
    // Create test course
    await prisma.course.upsert({
      where: { id: courseId },
      update: {},
      create: {
        id: courseId,
        title: 'Test Course',
        description: 'E2E test course',
        category: 'test',
      },
    });
    // Optional: create a second user for ownership tests
    if (otherUserId) {
      await prisma.user.upsert({
        where: { id: otherUserId },
        update: {},
        create: { id: otherUserId, email: `${otherUserId}@test.local`, name: 'Other User' },
      });
    }
    // Register the mock Stripe session
    registerMockSession(sessionId, userId, courseId, amount ?? 9900);
    return res.json({ status: 'success' });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/** Clean up DB rows, mock sessions, and inngest events. */
app.delete('/api/test/cleanup', async (req, res) => {
  try {
    const { userId, courseId } = req.body ?? {};
    if (userId && courseId) {
      await prisma.coursePurchase
        .deleteMany({ where: { userId, courseId } })
        .catch(() => undefined);
      await prisma.enrollment
        .deleteMany({ where: { userId, courseId } })
        .catch(() => undefined);
    }
    for (const k of Object.keys(MOCK_SESSIONS)) delete MOCK_SESSIONS[k];
    inngestEvents.length = 0;
    return res.json({ status: 'success' });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/** Read a purchase + enrollment row by composite key. */
app.get('/api/test/purchases/:userId/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const [purchase, enrollment] = await Promise.all([
      prisma.coursePurchase.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }),
      prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }),
    ]);
    return res.json({ status: 'success', data: { purchase, enrollment } });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/** Read the recorded Inngest events (snapshot). */
app.get('/api/test/inngest-events', (_req, res) => {
  return res.json({ status: 'success', data: [...inngestEvents] });
});

// ----- Start ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🧪 Test API server running on http://localhost:${PORT}`);
});
