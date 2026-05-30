// Inngest client for Vercel serverless functions
// This file contains the client and function definitions that will be
// served via the Next.js API route at /api/inngest

import { Inngest } from 'inngest';

// Create Inngest client
export const inngest = new Inngest({ 
  id: 'duobijac-api',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// ===========================================
// INNGEST FUNCTIONS
// ===========================================

/**
 * Handle course purchase completed
 * Workflow: Purchase recorded → Send confirmation → Award XP → Check achievements
 */
export const handleCoursePurchase = inngest.createFunction(
  { id: 'handle-course-purchase', name: 'Handle Course Purchase', triggers: [{ event: 'stripe/checkout.session.completed' }] },
  async ({ event, step }) => {
    const { userId, courseId, amount } = event.data as any;

    // Step 1: Award XP to user (simplified - full logic in API)
    await step.run('log-purchase', async () => {
      console.log(`[INNGEST] Course purchase event received for user ${userId}, course ${courseId}`);
    });

    return {
      message: `Course purchase event processed for user ${userId}`,
      eventType: 'stripe/checkout.session.completed',
    };
  }
);

/**
 * Handle lesson completion
 */
export const handleLessonCompletion = inngest.createFunction(
  { id: 'handle-lesson-completion', name: 'Handle Lesson Completion', triggers: [{ event: 'app/lesson.completed' }] },
  async ({ event, step }) => {
    const { userId, lessonId, xpEarned } = event.data as any;

    await step.run('log-completion', async () => {
      console.log(`[INNGEST] Lesson completion event received for user ${userId}, lesson ${lessonId}`);
    });

    return {
      message: `Lesson completion event processed for user ${userId}`,
      eventType: 'app/lesson.completed',
    };
  }
);

/**
 * Send daily progress emails
 */
export const sendDailyEmails = inngest.createFunction(
  { id: 'send-daily-emails', name: 'Send Daily Progress Emails', triggers: [{ event: 'app/daily-email' }] },
  async ({ step }) => {
    await step.run('log-trigger', async () => {
      console.log('[INNGEST] Daily email trigger received');
    });

    return { message: 'Daily email event processed' };
  }
);

// Export all functions
export const functions = [handleCoursePurchase, handleLessonCompletion, sendDailyEmails];