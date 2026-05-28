import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { sendDailyProgressEmail, isEmailConfigured } from './email.js';

// Schedule: Every day at 9:00 AM (server timezone)
const DAILY_EMAIL_CRON = '0 9 * * *';

// Track last run to prevent duplicate sends
let lastEmailRunDate: string | null = null;

/**
 * Get users who should receive daily email summary:
 * - Active users (logged in within last 7 days)
 * - Users who have started courses (enrollments)
 * - Users who have completed at least one lesson
 */
async function getUsersForDailyEmail(): Promise<Array<{ id: string; name: string; email: string }>> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return prisma.user.findMany({
    where: {
      role: 'user',
      lastActiveAt: { gte: sevenDaysAgo },
      enrollments: {
        some: {}, // Users with at least one enrollment
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 100, // Limit to 100 emails per day to avoid rate limits
  });
}

/**
 * Get daily stats for a user
 */
async function getUserDailyStats(userId: string): Promise<{
  lessonsCompleted: number;
  xpEarned: number;
  currentStreak: number;
  coursesInProgress: string[];
}> {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get lessons completed today
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      completedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    select: {
      xpEarned: true,
      completedAt: true,
      lesson: {
        select: {
          module: {
            select: {
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const lessonsCompleted = lessonProgress.filter(lp => lp.completedAt !== null).length;
  const xpEarned = lessonProgress.reduce((sum, lp) => sum + (lp.xpEarned || 0), 0);

  // Get unique courses in progress
  const coursesInProgressSet = new Set<string>();
  lessonProgress.forEach(lp => {
    if (lp.lesson?.module?.course?.title) {
      coursesInProgressSet.add(lp.lesson.module.course.title);
    }
  });

  // Get user's current streak
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true },
  });

  return {
    lessonsCompleted,
    xpEarned,
    currentStreak: user?.currentStreak || 0,
    coursesInProgress: Array.from(coursesInProgressSet),
  };
}

/**
 * Send daily progress email to a single user
 */
async function sendDailyEmailToUser(user: { id: string; name: string; email: string }): Promise<void> {
  try {
    const stats = await getUserDailyStats(user.id);
    
    // Only send if user has some activity (completed lessons today)
    // Or always send to keep them engaged (configurable)
    if (stats.lessonsCompleted === 0) {
      // User had no activity - don't send email to avoid spam
      console.log(`⏭️ Skipping daily email for ${user.email} (no activity today)`);
      return;
    }

    await sendDailyProgressEmail({
      userName: user.name,
      userEmail: user.email,
      lessonsCompleted: stats.lessonsCompleted,
      xpEarned: stats.xpEarned,
      currentStreak: stats.currentStreak,
      coursesInProgress: stats.coursesInProgress,
    });

    console.log(`✅ Daily email sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send daily email to ${user.email}:`, error);
  }
}

/**
 * Main job: Send daily email summaries
 */
async function sendDailyEmailSummaries(): Promise<void> {
  // Prevent duplicate runs on same day
  const todayStr = new Date().toISOString().split('T')[0];
  if (lastEmailRunDate === todayStr) {
    console.log('⏭️ Daily emails already sent today, skipping...');
    return;
  }

  if (!isEmailConfigured()) {
    console.log('⚠️ Email not configured, skipping daily emails');
    return;
  }

  console.log('📧 Starting daily email summary job...');
  const startTime = Date.now();

  try {
    const users = await getUsersForDailyEmail();
    console.log(`📬 Found ${users.length} users to send daily emails`);

    // Send emails with small delays to avoid rate limits
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await sendDailyEmailToUser(user);
        successCount++;
        
        // Small delay between emails (100ms) to avoid overwhelming the SMTP server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failCount++;
        console.error(`Failed to send email to ${user.email}:`, error);
      }
    }

    lastEmailRunDate = todayStr;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Daily email job completed in ${duration}s: ${successCount} sent, ${failCount} failed`);
  } catch (error) {
    console.error('❌ Daily email job failed:', error);
  }
}

/**
 * Start the cron scheduler
 */
export function startCronService(): void {
  console.log('⏰ Initializing cron service...');

  // Schedule the daily email job
  cron.schedule(DAILY_EMAIL_CRON, () => {
    console.log('\n========================================');
    console.log('🚀 Running scheduled: Daily Email Summary');
    console.log('========================================\n');
    void sendDailyEmailSummaries();
  }, {
    timezone: 'America/Mexico_City' // Use Mexico timezone (same as server likely)
  });

  console.log(`⏰ Daily email cron scheduled: ${DAILY_EMAIL_CRON} (9:00 AM)`);
  console.log('✅ Cron service initialized');
}

/**
 * Manually trigger daily emails (for testing/admin)
 */
export async function triggerDailyEmails(): Promise<{ success: boolean; message: string; count?: number }> {
  if (!isEmailConfigured()) {
    return { success: false, message: 'Email not configured' };
  }

  console.log('🔧 Manually triggering daily email job...');
  
  try {
    const users = await getUsersForDailyEmail();
    
    let successCount = 0;
    for (const user of users) {
      await sendDailyEmailToUser(user);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success: true, message: `Sent ${successCount} emails`, count: successCount };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}