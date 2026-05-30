# Deployment Guide - Render

This project is a monorepo with two services: **Next.js Web** and **Express API**.

## Option 1: Deploy Both Services (Recommended)

### Step 1: Create a Render account
- Go to https://render.com and sign up
- Connect your GitHub repository

### Step 2: Deploy the API first

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Select this repository
3. Render will detect `apps/api/render.yaml` and show it
4. Click **"Apply"**

Or deploy manually:
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `apps/api`
   - **Build Command:** `npx prisma generate && npm run build`
   - **Start Command:** `npx tsx src/index.ts`
4. Add the required Environment Variables (see below)
5. Click **"Create Web Service"**

### Step 3: Deploy the Web app

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `apps/web`
   - **Build Command:** `npx prisma generate --schema=../api/prisma/schema.prisma && npm run build`
   - **Start Command:** `npm run start`
4. Add the required Environment Variables (see below)
5. Click **"Create Web Service"**

---

## Environment Variables

### API (apps/api)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string from Render's free PostgreSQL |
| `CORS_ORIGIN` | ✅ | Your web app URL (e.g., `https://freebuffgame-web.onrender.com`) |
| `API_URL` | ✅ | Your API URL (e.g., `https://freebuffgame-api.onrender.com`) |
| `FRONTEND_URL` | ✅ | Your web app URL |
| `JWT_SECRET` | ✅ | Generate a secure random string |
| `ADMIN_PASSWORD` | ✅ | Password for admin access |
| `GOOGLE_CLIENT_ID` | ❌ | For Google OAuth (if using) |
| `GOOGLE_CLIENT_SECRET` | ❌ | For Google OAuth (if using) |
| `STRIPE_SECRET_KEY` | ❌ | For payments (if using) |
| `STRIPE_WEBHOOK_SECRET` | ❌ | For Stripe webhooks |
| `SMTP_HOST` | ❌ | Email SMTP host |
| `SMTP_PORT` | ❌ | Email SMTP port (default: 587) |
| `SMTP_USER` | ❌ | Email username |
| `SMTP_PASS` | ❌ | Email password |
| `INNGEST_EVENT_KEY` | ❌ | For background jobs |
| `INNGEST_SIGNING_KEY` | ❌ | For background jobs |
| `VAPID_PRIVATE_KEY` | ❌ | For push notifications |
| `VAPID_PUBLIC_KEY` | ❌ | For push notifications |
| `CRON_SECRET` | ❌ | Secret for cron endpoints |

### Web (apps/web)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Your API URL (e.g., `https://freebuffgame-api.onrender.com/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | From Clerk dashboard |
| `CLERK_SECRET_KEY` | ✅ | From Clerk dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | Set to `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | Set to `/register` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | ✅ | Set to `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | ✅ | Set to `/dashboard` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ❌ | For push notifications |
| `VAPID_PRIVATE_KEY` | ❌ | Must match API's VAPID_PRIVATE_KEY |

---

## Free Tier Limitations

- PostgreSQL free tier: 1 database, 256MB storage, 512MB RAM, 1 CPU
- Web services: Sleep after 15 min of inactivity (cold start ~30s)
- Disk: 1GB for services

**Tip:** Set up a Render PostgreSQL database first, then use its connection string in the API.

---

## Database Setup on Render

1. Create a PostgreSQL instance:
   - Dashboard → **"New +"** → **"PostgreSQL"**
   - Name: `freebuffgame-db`
   - Plan: **Free**
   - Region: Choose closest to you

2. Wait for the database to be provisioned (2-3 minutes)

3. Copy the **Internal Database URL** from the dashboard

4. Add this as `DATABASE_URL` environment variable in your API service

5. To run migrations/seeding, use Render's shell:
   - Go to your API service → **"Shell"**
   - Run: `npx prisma db push` (for schema)
   - Run: `npx prisma db seed` (for seed data, if configured)

---

## Quick Test

After deployment, test your endpoints:

```bash
# API Health check
curl https://freebuffgame-api.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Troubleshooting

### Build fails with "prisma generate" error
- Make sure `DATABASE_URL` is set correctly
- The prisma client generation needs the database to be reachable

### Web app shows 500 error
- Check that `NEXT_PUBLIC_API_URL` points to the correct API URL
- Verify CORS_ORIGIN in API includes your web app URL

### Cold start issues
- Render free tier sleeps after 15 min inactivity
- First request may take 30-60 seconds
- Consider upgrading to a paid plan for production