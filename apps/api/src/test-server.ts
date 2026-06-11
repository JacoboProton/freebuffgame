// @ts-nocheck - Test server: relaxed type checking to keep mocks concise.
/**
 * Self-contained test API server for Playwright e2e tests.
 *
 * Uses the real createCoursePurchaseRouter factory from
 * routes/course-purchase-handler.ts, composed with stub dependencies:
 *   - verifyPaymentSession  → in-memory map of mock sessions
 *   - constructWebhookEvent → plain JSON parse (no signature verification)
 *   - Inngest.send          → in-memory event recorder
 *   - authenticate          → header-based test auth (x-test-user-id)
 *
 * Real Prisma is used to write/read CoursePurchase + Enrollment rows so the
 * tests can assert that a purchase was actually recorded in the database.
 *
 * Safety: refuses to start unless NODE_ENV=test or ENABLE_TEST_ENDPOINTS is
 * set, so /api/test/* write endpoints can't accidentally be exposed in
 * production.
 *
 * Started by apps/api/playwright.config.ts → webServer.command before any spec runs.
 */
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { createCoursePurchaseRouter } from './routes/course-purchase-handler.js';

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

// Mirror the real index.ts rawBody capture so the factory's webhook handler
// can call constructWebhookEvent(req.rawBody, signature).
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    (req as any).rawBody = JSON.stringify(req.body);
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

// ----- Stub implementations of the factory's dependencies --------------------

/** Sets req.user from x-test-user-id header, rejects with 401 if missing. */
const testAuthMiddleware = (req: any, res: any, next: any) => {
  const testUserId = req.headers['x-test-user-id'];
  if (typeof testUserId !== 'string' || testUserId.length === 0) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  req.user = {
    id: testUserId,
    email: `${testUserId}@test.local`,
    role: 'user',
  };
  next();
};

const mockVerifyPaymentSession = async (sessionId: string) => {
  const session = MOCK_SESSIONS[sessionId];
  if (!session) return { success: false };
  return {
    success: true,
    userId: session.userId,
    courseId: session.courseId,
    paymentId: `pi_mock_${sessionId}`,
    amount: session.amount,
  };
};

const mockConstructWebhookEvent = (rawBody: string | Buffer) => {
  return JSON.parse(rawBody.toString());
};

const mockInngest = {
  send: async (event: { name: string; id?: string; data: any }) => {
    inngestEvents.push(event);
  },
};

// ----- Mount the real factory with stub dependencies --------------------------
app.use(
  '/api/payments',
  createCoursePurchaseRouter({
    verifyPaymentSession: mockVerifyPaymentSession,
    constructWebhookEvent: mockConstructWebhookEvent,
    inngest: mockInngest,
    prisma,
    authenticate: testAuthMiddleware,
  }),
);

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
      // Scoped cleanup: only remove mock sessions and Inngest events that
      // belong to this (userId, courseId). This lets the ownership test
      // register a session for OTHER_USER, then clean up TEST_USER without
      // nuking OTHER_USER's mock session.
      for (const [sid, s] of Object.entries(MOCK_SESSIONS)) {
        if (s.userId === userId) delete MOCK_SESSIONS[sid];
      }
      inngestEvents.splice(
        0,
        inngestEvents.length,
        ...inngestEvents.filter((e) => e.data?.userId !== userId),
      );
    } else {
      // Full reset (no userId/courseId provided)
      for (const k of Object.keys(MOCK_SESSIONS)) delete MOCK_SESSIONS[k];
      inngestEvents.length = 0;
    }
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
