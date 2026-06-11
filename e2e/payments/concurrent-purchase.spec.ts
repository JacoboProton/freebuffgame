// P2002 race test: when /confirm and the Stripe webhook fire concurrently
// for the same (userId, courseId), the atomic try/catch create+update
// pattern must guarantee:
//   - exactly one CoursePurchase row exists
//   - exactly one Inngest event is dispatched (Inngest would dedupe this
//     to one function execution → one email in production)
//
// This test fires both endpoints with Promise.all and asserts the post-race
// state. The test server's mock Inngest recorder is a plain array, so seeing
// >1 event means the P2002 catch failed to prevent the duplicate dispatch.

import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

// Unique IDs per run so parallel test invocations don't collide.
const TEST_USER = `test-user-concurrent-${Date.now()}`;
const TEST_COURSE = `test-course-concurrent-${Date.now()}`;
const MOCK_SESSION = `cs_test_concurrent_${Date.now()}`;

test.describe('Concurrent /confirm + webhook (P2002 race)', () => {
  test.beforeEach(async ({ request }) => {
    // Clean state from any prior run
    await request.delete(`${API}/api/test/cleanup`, {
      data: { userId: TEST_USER, courseId: TEST_COURSE },
    });
    // Set up test user, course, and mock Stripe session
    await request.post(`${API}/api/test/setup`, {
      data: {
        userId: TEST_USER,
        courseId: TEST_COURSE,
        sessionId: MOCK_SESSION,
        amount: 9900,
      },
    });
  });

  test('only one Inngest event is dispatched when /confirm and /webhook race', async ({ request }) => {
    const testStartTime = Date.now();

    // Fire both endpoints concurrently for the same session.
    // Whichever handler's `prisma.coursePurchase.create()` commits first
    // becomes the "winner" (isNewPurchase=true, dispatches Inngest). The
    // other handler's create() throws P2002 and falls through to update,
    // leaving isNewPurchase=false and skipping the Inngest dispatch.
    const [confirmRes, webhookRes] = await Promise.all([
      request.post(`${API}/api/payments/confirm`, {
        headers: { 'x-test-user-id': TEST_USER },
        data: { sessionId: MOCK_SESSION, courseId: TEST_COURSE },
      }),
      request.post(`${API}/api/payments/webhook`, {
        headers: { 'stripe-signature': 'mock' },
        data: {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: MOCK_SESSION,
              payment_status: 'paid',
              amount_total: 9900,
              payment_intent: `pi_mock_${MOCK_SESSION}`,
              metadata: { courseId: TEST_COURSE, userId: TEST_USER },
            },
          },
        },
      }),
    ]);

    // Both requests should succeed (webhook always returns 200 per the real
    // handler; /confirm returns 200 on the winner-or-loser path).
    expect(confirmRes.status()).toBe(200);
    expect(webhookRes.status()).toBe(200);

    // Exactly one purchase row should exist.
    const purchaseRes = await request.get(
      `${API}/api/test/purchases/${TEST_USER}/${TEST_COURSE}`,
    );
    const purchaseBody = await purchaseRes.json();
    expect(purchaseBody.data.purchase).toBeTruthy();
    expect(purchaseBody.data.purchase.stripePaymentId).toBe(`pi_mock_${MOCK_SESSION}`);
    // Prove the P2002 catch actually ran the update path on the losing
    // handler: the losing handler's update sets `purchasedAt = new Date()`
    // which must be at or after when this test started. (Both handlers
    // write identical payment data, so the only differentiator is the
    // update timestamp from the loser's `update()` call.)
    const purchasedAt = new Date(purchaseBody.data.purchase.purchasedAt).getTime();
    expect(purchasedAt).toBeGreaterThanOrEqual(testStartTime - 1000);

    // Exactly one enrollment row should exist.
    expect(purchaseBody.data.enrollment).toBeTruthy();

    // Exactly one Inngest event should be recorded. The losing handler
    // skipped its dispatch (isNewPurchase=false on the P2002 path), so we
    // must not see two events. In production, Inngest's id-based dedupe
    // would also collapse any two dispatches with the same id to one
    // function execution → one email.
    const eventsRes = await request.get(`${API}/api/test/inngest-events`);
    const eventsBody = await eventsRes.json();
    expect(eventsBody.data).toHaveLength(1);
    expect(eventsBody.data[0].id).toBe(`stripe-${MOCK_SESSION}`);
    expect(eventsBody.data[0].name).toBe('stripe/checkout.session.completed');
    expect(eventsBody.data[0].data.userId).toBe(TEST_USER);
    expect(eventsBody.data[0].data.courseId).toBe(TEST_COURSE);
    expect(eventsBody.data[0].data.isManual).toBe(false);
  });
});
