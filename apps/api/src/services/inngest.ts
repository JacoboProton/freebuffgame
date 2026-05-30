// @ts-nocheck - Inngest library has type conflicts with our TS version
import { Inngest } from 'inngest';
import { prisma } from '../lib/prisma.js';
import { sendPurchaseConfirmationEmail, sendDailyProgressEmail, isEmailConfigured } from './email.js';

// Create Inngest client
export const inngest = new Inngest({ 
  id: 'duobijac-api',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// ===========================================
// INNGEST FUNCTIONS
// ===========================================

/**
 * Send daily progress emails to active users
 * Triggered by cron schedule or manual trigger
 */
export const sendDailyEmails = inngest.createFunction(
  { id: 'send-daily-emails', name: 'Send Daily Progress Emails', triggers: [{ event: 'app/daily-email' }] },
  async ({ step }: { step: any }) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Step 1: Get active users who should receive emails
    const users = await step.run('get-active-users', async () => {
      return prisma.user.findMany({
        where: {
          role: 'user',
          lastActiveAt: { gte: sevenDaysAgo },
          enrollments: { some: {} },
        },
        select: { id: true, name: true, email: true },
        take: 100,
      });
    });

    // Step 2: Process each user
    const results = await step.run('process-user-emails', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        try {
          // Get lessons completed today
          const lessonProgress = await prisma.lessonProgress.findMany({
            where: {
              userId: user.id,
              completedAt: { gte: today, lt: tomorrow },
            },
            select: {
              xpEarned: true,
              lesson: {
                select: {
                  module: {
                    select: { course: { select: { title: true } } },
                  },
                },
              },
            },
          });

          const lessonsCompleted = lessonProgress.filter(lp => lp.completedAt !== null).length;
          
          // Skip if no activity
          if (lessonsCompleted === 0) {
            continue;
          }

          const xpEarned = lessonProgress.reduce((sum, lp) => sum + (lp.xpEarned || 0), 0);
          const coursesInProgress = [...new Set(
            lessonProgress
              .filter(lp => lp.lesson?.module?.course?.title)
              .map(lp => lp.lesson.module.course.title)
          )];

          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { currentStreak: true },
          });

          if (isEmailConfigured()) {
            await sendDailyProgressEmail({
              userName: user.name,
              userEmail: user.email,
              lessonsCompleted,
              xpEarned,
              currentStreak: userData?.currentStreak || 0,
              coursesInProgress,
            });
          }

          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to send email to ${user.email}:`, error);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { successCount, failCount };
    });

    return { 
      message: `Sent ${results.successCount} emails, ${results.failCount} failed`,
      usersProcessed: users.length,
    };
  }
);

/**
 * Handle course purchase completed
 * Workflow: Purchase recorded → Send confirmation → Award XP → Check achievements
 */
export const handleCoursePurchase = inngest.createFunction(
  { id: 'handle-course-purchase', name: 'Handle Course Purchase', triggers: [{ event: 'stripe/checkout.session.completed' }] },
  async ({ event, step }) => {
    const { userId, courseId, amount } = event.data;

    // Step 1: Get user and course details
    const { user, course } = await step.run('get-details', async () => {
      const [user, course] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.course.findUnique({ where: { id: courseId } }),
      ]);
      return { user, course };
    });

    if (!user || !course) {
      return { message: 'User or course not found' };
    }

    // Step 2: Send purchase confirmation email
    await step.run('send-email', async () => {
      if (isEmailConfigured()) {
        await sendPurchaseConfirmationEmail({
          userName: user.name,
          userEmail: user.email,
          courseTitle: course.title,
          courseCategory: course.category,
          courseId: course.id,
          amountPaid: amount,
          paymentId: event.data.paymentIntentId || 'unknown',
          purchaseDate: new Date().toLocaleString('es-ES'),
          isManual: false,
        });
      }
    });

    // Step 3: Award XP to user
    const xpEarned = await step.run('award-xp', async () => {
      const safeAmount = typeof amount === 'number' ? amount : 0;
      const xpAmount = Math.floor(safeAmount / 100) * 10; // 10 XP per dollar
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          xp: { increment: xpAmount },
          coins: { increment: Math.floor(xpAmount / 2) },
        },
      });
      return { xpAdded: xpAmount, newXp: updatedUser.xp, newLevel: updatedUser.level };
    });

    // Step 4: Check and award achievements
    await step.run('check-achievements', async () => {
      // First purchase achievement
      const purchaseCount = await prisma.coursePurchase.count({ where: { userId } });
      
      if (purchaseCount === 1) {
        const achievement = await prisma.achievement.findUnique({ where: { key: 'first_purchase' } });
        if (achievement) {
          await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: achievement.id } },
            update: {},
            create: { userId, achievementId: achievement.id },
          });
        }
      }
    });

    return {
      message: `Purchase workflow completed for ${user.name}`,
      xpEarned: xpEarned.xpAdded,
      emailSent: isEmailConfigured(),
    };
  }
);

/**
 * Handle lesson completion
 * Workflow: Lesson completed → Update progress → Award XP → Check streak
 */
export const handleLessonCompletion = inngest.createFunction(
  { id: 'handle-lesson-completion', name: 'Handle Lesson Completion', triggers: [{ event: 'app/lesson.completed' }] },
  async ({ event, step }) => {
    const { userId, lessonId, xpEarned } = event.data;

    // Step 1: Get user and check streak
    const user = await step.run('get-user', async () => {
      return prisma.user.findUnique({ where: { id: userId } });
    });

    if (!user) return { message: 'User not found' };

    // Step 2: Update streak if needed
    const { newStreak, leveledUp } = await step.run('update-streak', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      let newStreak = user.currentStreak;
      let leveledUp = false;

      // Check if last activity was yesterday to continue streak
      if (user.lastActiveAt && user.lastActiveAt >= yesterday) {
        newStreak = user.currentStreak + 1;
      } else if (!user.lastActiveAt || user.lastActiveAt < yesterday) {
        newStreak = 1; // Reset streak
      }

      // Calculate new level (100 XP per level)
      const newXp = user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;

      if (newLevel > user.level) {
        leveledUp = true;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { 
          currentStreak: newStreak,
          lastActiveAt: new Date(),
          xp: newXp,
          level: newLevel,
        },
      });

      return { newStreak, leveledUp, newLevel };
    });

    // Step 3: Check streak achievements
    await step.run('check-streak-achievements', async () => {
      const streakAchievements = [
        { streak: 7, key: 'streak_7_days' },
        { streak: 30, key: 'streak_30_days' },
      ];

      for (const { streak, key } of streakAchievements) {
        if (newStreak >= streak) {
          const achievement = await prisma.achievement.findUnique({ where: { key } });
          if (achievement) {
            await prisma.userAchievement.upsert({
              where: { userId_achievementId: { userId, achievementId: achievement.id } },
              update: {},
              create: { userId, achievementId: achievement.id },
            });
          }
        }
      }
    });

    return {
      message: `Lesson completion processed for user ${userId}`,
      newStreak,
      leveledUp,
    };
  }
);

// ===========================================
// EXPORT ALL FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const functions: any[] = [
  sendDailyEmails,
  handleCoursePurchase,
  handleLessonCompletion,
];