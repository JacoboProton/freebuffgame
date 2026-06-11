# e2e — API integration tests

Playwright-based API tests for the payment flow. Uses the `request` fixture
(no browser binaries needed) to hit a mock-backed test API server.

## What it tests

- **Happy path**: `POST /api/payments/confirm` with a mock `session_id`
  returns **200**, records a `CoursePurchase` + `Enrollment` row in the real
  Postgres database, and dispatches exactly one `stripe/checkout.session.completed`
  Inngest event with a deterministic id.
- **Ownership check**: a different user trying to confirm someone else's
  session gets **403** and no DB rows are written.
- **Validation**: missing `courseId` or an unknown `sessionId` returns **400**.
- **Idempotency**: calling `/payments/confirm` twice for the same session
  does not dispatch a duplicate Inngest event.

## Architecture

```
e2e/payments/stripe-success.spec.ts   ← Playwright test (uses `request` fixture)
              │
              ▼
playwright.config.ts                   ← Launches webServer before tests run
              │
              ▼
apps/api/src/test-server.ts            ← Self-contained Express server
                                           • Mocks: Stripe / Clerk / Inngest
                                           • Real: Prisma → CoursePurchase + Enrollment
```

`apps/api/src/test-server.ts` is **not** the production API. It is a
purpose-built test double that:
- Replaces `verifyPaymentSession` with an in-memory `MOCK_SESSIONS` map
- Replaces the `authenticate` middleware with header-based test auth
  (`x-test-user-id`)
- Replaces `inngest.send` with an in-memory event recorder
- Uses the real Prisma client to write/read `CoursePurchase` + `Enrollment`
  rows so the tests assert against the actual database state

## Prerequisites

1. **Postgres** — the test server connects to a real DB via `DATABASE_URL`.
   The same DB used by `apps/api` works (the test uses uniquely-named rows
   and cleans up after itself).
2. **`apps/api/.env`** must contain `DATABASE_URL`. The Playwright config
   reads this file and forwards the variables to the test server.
3. **`@playwright/test`** is installed in `apps/api`:
   ```bash
   cd apps/api && npm install -D @playwright/test
   ```

## Local setup (Windows workaround)

> **⚠️ Only needed on Windows.** The `playwright.config.ts` lives at the
> project root, but `@playwright/test` is installed in
> `apps/api/node_modules`. Node's module resolution from the project root
> looks for `node_modules/@playwright/test` (which doesn't exist), so the
> config fails to load. On macOS/Linux, the `npm install -D @playwright/test`
> step above puts it in `apps/api/node_modules` and `npx` finds it via the
> `apps/api` working directory. On Windows, you also need the root to be
> able to resolve the module.

Create two directory junctions at the project root (run from the project root):

```bash
# Junction node_modules/@playwright → apps/api/node_modules/@playwright
cmd //c "mklink /J node_modules\@playwright apps\api\node_modules\@playwright"

# Junction node_modules/playwright → apps/api/node_modules/playwright
cmd //c "mklink /J node_modules\playwright apps\api\node_modules\playwright"
```

**Important:** these junctions are **local-only** — they are not committed
to git and will be wiped on any `npm install` at the project root or in
`apps/api`. Recreate them after a fresh install.

**`.bin` junction fails** because `node_modules/.bin` already exists at the
root. Two workarounds:
- Run the CLI via Node directly: `node node_modules/playwright/cli.js test`
- Or add a one-off PATH entry: `PATH="$(pwd)/node_modules/.bin:$PATH" npm run test:e2e` (from `apps/api`)

**Long-term fix:** install `@playwright/test` at the project root
(`npm install -D @playwright/test` from the root). This is currently blocked
by workspace protocol deps in the root `package.json`; either resolve those
or move `playwright.config.ts` into `apps/api/`.

## Running

```bash
# From apps/api (uses the root playwright.config.ts via walk-up):
cd apps/api
npm run test:e2e
```

The first run will:
- Start the test API server on `http://localhost:3001`
- Run all specs in `e2e/`
- Tear the server down on exit

To run a single spec:
```bash
cd apps/api && npx playwright test e2e/payments/stripe-success.spec.ts
```

## Adding new tests

1. Add a new `.spec.ts` under `e2e/<area>/`
2. Use the `request` fixture — no browser needed
3. Call the test endpoints (`/api/test/setup`, `/api/test/cleanup`,
   `/api/test/purchases/:userId/:courseId`, `/api/test/inngest-events`)
   to control fixtures and assert state
