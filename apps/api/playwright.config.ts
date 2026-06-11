// Playwright config for the API integration tests.
// Lives next to its dependencies in apps/api/, so @playwright/test resolves
// naturally and no Windows directory junctions are required.
// Run:  cd apps/api && npm run test:e2e
import { defineConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Read apps/api/.env so the test server gets DATABASE_URL etc.
// We don't pull in a dotenv dep just for this — simple manual parser.
function loadApiEnv(): Record<string, string> {
  // Config lives in apps/api/, so ./.env is apps/api/.env.
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const out: Record<string, string> = {};
  for (const raw of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const apiEnv = loadApiEnv();

export default defineConfig({
  // e2e/ lives next to this config (apps/api/e2e/), so all dependencies
  // (including @playwright/test in apps/api/node_modules) resolve naturally
  // and no Windows directory junctions are required.
  testDir: path.resolve(__dirname, './e2e'),
  // Tests only use the `request` fixture — no browser needed, so we don't
  // configure any projects. Playwright will not launch a browser for these
  // tests, and chromium binaries are not required to run them.
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1, // tests share DB rows; run serially
  // The list reporter keeps CI logs readable; the html reporter writes a
  // self-contained HTML report to playwright-report/ (with traces, videos,
  // and screenshots) that the CI workflow uploads as an artifact on
  // failure. `open: 'never'` prevents Playwright from trying to open the
  // report in a browser (which would fail in CI).
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3001',
    extraHTTPHeaders: {
      // The test auth middleware reads this header to inject a fake user.
      // Tests override it per-request with their own test user.
      'x-test-user-id': 'e2e-default-user',
    },
  },
  webServer: {
    // We're already in apps/api/ (the config's __dirname), so no `cd` is
    // needed and the prisma schema is found at the relative path below.
    // `prisma generate` keeps the client up-to-date even if the user just
    // cloned the repo.
    command:
      'npx prisma generate --schema=prisma/schema.prisma && npx tsx src/test-server.ts',
    port: 3001,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      ...apiEnv,
      NODE_ENV: 'test',
      // The test server's mocks short-circuit Stripe/Clerk/Inngest, so these
      // can be empty placeholders. DATABASE_URL must still be a real Postgres
      // because the test writes real CoursePurchase + Enrollment rows.
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
    },
  },
});
