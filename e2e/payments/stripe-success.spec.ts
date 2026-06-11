/**
 * Playwright e2e test for the Stripe /payments/confirm success flow.
 *
 * Exercises the full flow with a mock session_id:
 *   1. POST /api/payments/confirm → expect 200
 *   2. Verify a CoursePurchase row was recorded in the DB
 *   3. Verify an Enrollment row was created
 *   4. Verify exactly one Inngest event was dispatched
 *
 * Also covers: ownership check (403), missing data (400), and idempotency.
 *
 * Run from apps/api:  npx playwright test
 * (or from the root:  cd apps/api && npm run test:e2e)
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

test.describe('Stripe success flow — POST /api/payments/confirm', () => {
  const TEST_USER = 'e2e-test-user-001';
  const TEST_COURSE = 'e2e-test-course-001';
  const MOCK_SESSION = 'cs_test_mock_e2e_001';
  const MOCK_AMOUNT = 9900; // $99.00

  test.beforeEach(async ({ request }) => {
    // Wipe any prior DB rows + mock state for this user/course, then
    // re-create the test user, test course, and mock Stripe session.
    await request.delete(`${API}/api/test/cleanup`, {
      data: { userId: TEST_USER, courseId: TEST_COURSE },
    });
    await request.post(`${API}/api/test/setup`, {
      data: { userId: TEST_USER, courseId: TEST_COURSE, sessionId: MOCK_SESSION, amount: MOCK_AMOUNT },
    });
  });

  test('happy path: confirm returns 200, records purchase + enrollment, and dispatches exactly one Inngest event', async ({
    request,
  }) => {
    // 1. Call /payments/confirm
    const res = await request.post(`${API}/api/payments/confirm`, {
      headers: { 'x-test-user-id': TEST_USER },
      data: { sessionId: MOCK_SESSION, courseId: TEST_COURSE },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.data.purchased).toBe(true);
    expect(body.data.purchaseId).toBeTruthy();

    // 2. Verify DB: CoursePurchase row
    const checkRes = await request.get(`${API}/api/test/purchases/${TEST_USER}/${TEST_COURSE}`);
    expect(checkRes.status()).toBe(200);
    const check = (await checkRes.json()).data;
    expect(check.purchase).toBeTruthy();
    expect(check.purchase.userId).toBe(TEST_USER);
    expect(check.purchase.courseId).toBe(TEST_COURSE);
    expect(check.purchase.stripePaymentId).toBe(`pi_mock_${MOCK_SESSION}`);
    expect(check.purchase.amountPaid).toBe(MOCK_AMOUNT);

    // 3. Verify DB: Enrollment row
    expect(check.enrollment).toBeTruthy();
    expect(check.enrollment.userId).toBe(TEST_USER);
    expect(check.enrollment.courseId).toBe(TEST_COURSE);

    // 4. Verify Inngest: exactly one event with deterministic id
    const eventsRes = await request.get(`${API}/api/test/inngest-events`);
    expect(eventsRes.status()).toBe(200);
    const events = (await eventsRes.json()).data;
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('stripe/checkout.session.completed');
    expect(events[0].id).toBe(`stripe-${MOCK_SESSION}`);
    // Assert the contract (name + id + the keys the handler depends on) but
    // NOT the full payload shape, so this test survives payload evolution.
    expect(events[0].data.userId).toBe(TEST_USER);
    expect(events[0].data.courseId).toBe(TEST_COURSE);
  });

  test('rejects a session belonging to a different user with 403', async ({ request }) => {
    const OTHER_USER = 'e2e-other-user-001';
    const OTHER_SESSION = 'cs_test_mock_e2e_other';

    // Set up a second user and a mock session owned by the OTHER user
    await request.post(`${API}/api/test/setup`, {
      data: { userId: OTHER_USER, courseId: TEST_COURSE, sessionId: OTHER_SESSION, amount: MOCK_AMOUNT },
    });
    // Make sure TEST_USER doesn't have a purchase for this course yet
    await request.delete(`${API}/api/test/cleanup`, {
      data: { userId: TEST_USER, courseId: TEST_COURSE },
    });

    // TEST_USER tries to confirm OTHER_USER's session
    const res = await request.post(`${API}/api/payments/confirm`, {
      headers: { 'x-test-user-id': TEST_USER },
      data: { sessionId: OTHER_SESSION, courseId: TEST_COURSE },
    });
    expect(res.status()).toBe(403);

    // No purchase should be recorded for TEST_USER
    const check = await request.get(`${API}/api/test/purchases/${TEST_USER}/${TEST_COURSE}`);
    const checkBody = (await check.json()).data;
    expect(checkBody.purchase).toBeNull();
    expect(checkBody.enrollment).toBeNull();

    // No Inngest event should have been dispatched
    const events = (await (await request.get(`${API}/api/test/inngest-events`)).json()).data;
    expect(events).toHaveLength(0);
  });

  test('returns 400 when courseId is missing', async ({ request }) => {
    const res = await request.post(`${API}/api/payments/confirm`, {
      headers: { 'x-test-user-id': TEST_USER },
      data: { sessionId: MOCK_SESSION }, // no courseId
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 when sessionId is unknown (Stripe session not paid)', async ({ request }) => {
    const res = await request.post(`${API}/api/payments/confirm`, {
      headers: { 'x-test-user-id': TEST_USER },
      data: { sessionId: 'cs_test_unknown_session', courseId: TEST_COURSE },
    });
    expect(res.status()).toBe(400);
  });

  test('idempotency: calling confirm twice does not dispatch a duplicate Inngest event', async ({
    request,
  }) => {
    // First call
    const res1 = await request.post(`${API}/api/payments/confirm`, {
      headers: { 'x-test-user-id': TEST_USER },
      data: { sessionId: MOCK_SESSION, courseId: TEST_COURSE },
    });
    expect(res1.status()).toBe(200);

    // Second call with the same session
    const res2 = await request.post(`${API}/api/payments/confirm`, {
      headers: { 'x-test-user-id': TEST_USER },
      data: { sessionId: MOCK_SESSION, courseId: TEST_COURSE },
    });
    expect(res2.status()).toBe(200);

    // Inngest dedupe → still exactly one event
    const events = (await (await request.get(`${API}/api/test/inngest-events`)).json()).data;
    expect(events).toHaveLength(1);
  });
});
