import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { SubmitProgressSchema } from '@duobijac/shared';
import { AppError } from '../middlewares/error.js';
import { sendCourseCompletionEmail, isEmailConfigured } from '../services/email.js';

export const lessonsRouter = Router();

// Get lesson content
lessonsRouter.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError('Lección no encontrada', 404);
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: lesson.module.course.id,
        },
      },
    });

    if (!enrollment) {
      throw new AppError('No estás enrolled en este curso', 403);
    }

    // Get progress if exists
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: req.user!.id, lessonId: lesson.id } },
    });

    res.json({
      status: 'success',
      data: {
        lesson: {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          xpReward: lesson.xpReward,
          order: lesson.order,
          moduleTitle: lesson.module.title,
          courseId: lesson.module.course.id,
          courseTitle: lesson.module.course.title,
        },
        progress: progress ? {
          completed: progress.completed,
          score: progress.score,
          xpEarned: progress.xpEarned,
          attempts: progress.attempts,
        } : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Submit lesson progress
lessonsRouter.post('/:id/progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = SubmitProgressSchema.parse(req.body);

    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        module: { select: { courseId: true } },
      },
    });

    if (!lesson) {
      throw new AppError('Lección no encontrada', 404);
    }

    // Get existing progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: req.user!.id, lessonId: lesson.id } },
    });

    const isCorrect = data.score >= 70; // Pass threshold
    const xpEarned = isCorrect ? lesson.xpReward : Math.floor(lesson.xpReward * 0.5);
    const completed = isCorrect;

    const progress = existingProgress
      ? await prisma.lessonProgress.update({
          where: { id: existingProgress.id },
          data: {
            score: Math.max(existingProgress.score, data.score),
            attempts: { increment: 1 },
            completed: existingProgress.completed || completed,
            xpEarned: Math.max(existingProgress.xpEarned, xpEarned),
            timeSpent: { increment: data.timeSpent },
            completedAt: completed && !existingProgress.completed ? new Date() : existingProgress.completedAt,
          },
        })
      : await prisma.lessonProgress.create({
          data: {
            userId: req.user!.id,
            lessonId: lesson.id,
            score: data.score,
            xpEarned,
            timeSpent: data.timeSpent,
            attempts: 1,
            completed,
            completedAt: completed ? new Date() : null,
          },
        });

    // If completed, update user's XP
    if (completed && (!existingProgress || !existingProgress.completed)) {
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          xp: { increment: xpEarned },
          coins: { increment: Math.floor(xpEarned / 10) },
        },
      });

      // Check for level up
      const oldLevel = Math.floor((user.xp - xpEarned) / 500) + 1;
      const newLevel = Math.floor(user.xp / 500) + 1;
      const leveledUp = newLevel > oldLevel;

      // Check achievements
      await checkAchievements(req.user!.id);

      // Check if course is now complete (all lessons done)
      const isCourseComplete = await checkCourseCompletion(req.user!.id, lesson.module.courseId);

      res.json({
        status: 'success',
        data: {
          progress: {
            completed: progress.completed,
            score: progress.score,
            xpEarned: progress.xpEarned,
          },
          user: {
            xp: user.xp,
            coins: user.coins,
            level: user.level,
          },
          leveledUp,
          newLevel: leveledUp ? newLevel : undefined,
          courseCompleted: isCourseComplete,
        },
      });
    } else {
      res.json({
        status: 'success',
        data: {
          progress: {
            completed: progress.completed,
            score: progress.score,
            xpEarned: progress.xpEarned,
          },
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

// Helper function to check achievements
async function checkAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: true },
  });

  if (!user) return;

  const unlockedKeys = new Set(user.achievements.map((a) => a.achievementId));

  // Check XP achievements
  const xpAchievements = [
    { key: 'first_xp', requirement: user.xp >= 10 },
    { key: 'xp_100', requirement: user.xp >= 100 },
    { key: 'xp_500', requirement: user.xp >= 500 },
    { key: 'xp_1000', requirement: user.xp >= 1000 },
  ];

  // Check streak achievements
  const streakAchievements = [
    { key: 'streak_3', requirement: user.currentStreak >= 3 },
    { key: 'streak_7', requirement: user.currentStreak >= 7 },
    { key: 'streak_30', requirement: user.currentStreak >= 30 },
  ];

  const achievementsToCheck = [...xpAchievements, ...streakAchievements];

  for (const achievement of achievementsToCheck) {
    if (!unlockedKeys.has(achievement.key) && achievement.requirement) {
      const dbAchievement = await prisma.achievement.findUnique({
        where: { key: achievement.key },
      });

      if (dbAchievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: dbAchievement.id,
          },
        });

        // Give XP reward
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: dbAchievement.xpReward } },
        });
      }
    }
  }
}

// Helper function to check if course is complete
async function checkCourseCompletion(userId: string, courseId: string): Promise<boolean> {
  // Get all lessons in the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: true },
      },
    },
  });

  if (!course) return false;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  
  // Get user's completed lessons for this course
  const completedProgress = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lesson: {
        module: { courseId },
      },
    },
  });

  const isComplete = completedProgress >= totalLessons;    // If course is complete, update enrollment and send email
    if (isComplete) {
      // Update enrollment to completed
      await prisma.enrollment.updateMany({
        where: {
          userId,
          courseId,
        },
        data: {
          completed: true,
        },
      });

    // Get user and course stats for email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user && isEmailConfigured()) {
      // Get total time spent
      const lessonProgressList = await prisma.lessonProgress.findMany({
        where: { userId, lesson: { module: { courseId } } },
      });
      
      const totalTimeSpent = lessonProgressList.reduce((acc, p) => acc + p.timeSpent, 0);
      const totalXP = lessonProgressList.reduce((acc, p) => acc + p.xpEarned, 0);
      
      const hours = Math.floor(totalTimeSpent / 3600);
      const minutes = Math.floor((totalTimeSpent % 3600) / 60);
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      sendCourseCompletionEmail({
        userName: user.name,
        userEmail: user.email,
        courseTitle: course.title,
        completedLessons: totalLessons,
        totalLessons,
        totalXP,
        completionDate: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        totalTimeSpent: timeStr,
      }).catch(err => console.error('Failed to send completion email:', err));
    }

    // Check course completion achievements
    const completedCourses = await prisma.enrollment.count({
      where: { userId, completed: true },
    });

    const courseAchievements = [
      { key: 'course_complete', requirement: completedCourses >= 1 },
      { key: 'course_3_complete', requirement: completedCourses >= 3 },
    ];

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
    const unlockedKeys = new Set(userAchievements.map((ua) => ua.achievement.key));

    for (const ach of courseAchievements) {
      if (!unlockedKeys.has(ach.key) && ach.requirement) {
        const dbAchievement = await prisma.achievement.findUnique({ where: { key: ach.key } });
        if (dbAchievement) {
          await prisma.userAchievement.create({ data: { userId, achievementId: dbAchievement.id } });
          await prisma.user.update({ where: { id: userId }, data: { xp: { increment: dbAchievement.xpReward } } });
        }
      }
    }
  }

  return isComplete;
}