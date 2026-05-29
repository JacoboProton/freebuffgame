import { Router } from 'express';
import { serve } from 'inngest/express';
import { inngest, functions } from '../services/inngest.js';
import { isEmailConfigured } from '../services/email.js';

export const inngestRouter = Router();

// Serve Inngest functions via Express
inngestRouter.use(
  '/',
  serve({
    client: inngest,
    functions,
  })
);

// Trigger daily emails manually (for testing or admin)
inngestRouter.post('/trigger/daily-emails', async (_req, res) => {
  if (!isEmailConfigured()) {
    return res.json({ 
      status: 'error', 
      message: 'Email not configured' 
    });
  }

  try {
    // Send event to trigger the daily emails function
    await inngest.send({
      name: 'app/daily-email',
      data: {
        triggeredAt: new Date().toISOString(),
        triggeredBy: 'manual',
      },
    });

    res.json({
      status: 'success',
      message: 'Daily emails job triggered',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Trigger course purchase workflow (for testing)
inngestRouter.post('/trigger/course-purchase', async (req, res) => {
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
});

// Trigger lesson completion workflow
inngestRouter.post('/trigger/lesson-completion', async (req, res) => {
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
});

// Health check for Inngest
inngestRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    inngestConfigured: true,
    functionsCount: functions.length,
    functions: functions.map(f => f.id),
  });
});