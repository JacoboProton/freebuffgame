import { Router } from 'express';
import { serve } from 'inngest/express';
import { inngest, functions } from '../services/inngest.js';
import { isEmailConfigured } from '../services/email.js';
import { AuthRequest, authenticate, requireAdmin } from '../middlewares/auth.js';

export const inngestRouter = Router();

// Validate INNGEST_EVENT_KEY at startup
if (!process.env.INNGEST_EVENT_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[INNGEST] FATAL: INNGEST_EVENT_KEY is not set in production!');
    process.exit(1);
  } else {
    console.warn('[INNGEST] WARNING: INNGEST_EVENT_KEY not set - using development mode without event key');
  }
} else {
  console.log('[INNGEST] Event key configured');
}

// Serve Inngest functions via Express
inngestRouter.use(
  '/',
  serve({
    client: inngest,
    functions,
  })
);

// Trigger course purchase workflow (admin only)
inngestRouter.post(
  '/trigger/course-purchase',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { userId, courseId, amount, paymentIntentId } = req.body;

      if (!userId || !courseId) {
        return res.status(400).json({
          status: 'error',
          message: 'userId and courseId are required',
        });
      }

      await inngest.send({
        name: 'stripe/checkout.session.completed',
        data: {
          userId,
          courseId,
          amount: amount || 0,
          paymentIntentId: paymentIntentId || 'test',
        },
      });

      res.json({
        status: 'success',
        message: `Course purchase workflow triggered for user ${userId}`,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
);

// Trigger lesson completion workflow (admin only)
inngestRouter.post(
  '/trigger/lesson-completion',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { userId, lessonId, xpEarned } = req.body;

      if (!userId || !lessonId) {
        return res.status(400).json({
          status: 'error',
          message: 'userId and lessonId are required',
        });
      }

      await inngest.send({
        name: 'app/lesson.completed',
        data: {
          userId,
          lessonId,
          xpEarned: xpEarned || 10,
        },
      });

      res.json({
        status: 'success',
        message: `Lesson completion workflow triggered for user ${userId}`,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
);

// Health check for Inngest
inngestRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    inngestConfigured: true,
    functionsCount: functions.length,
    functions: functions.map(f => f.id),
  });
});