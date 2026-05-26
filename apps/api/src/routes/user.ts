import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';

export const userRouter = Router();

// Get user stats
userRouter.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        xp: true,
        level: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Get lesson progress stats
    const totalLessonsCompleted = await prisma.lessonProgress.count({
      where: { userId: req.user!.id, completed: true },
    });

    const totalTimeSpent = await prisma.lessonProgress.aggregate({
      where: { userId: req.user!.id },
      _sum: { timeSpent: true },
    });

    const totalXPFromLessons = await prisma.lessonProgress.aggregate({
      where: { userId: req.user!.id },
      _sum: { xpEarned: true },
    });

    // Get enrolled courses count
    const enrolledCourses = await prisma.enrollment.count({
      where: { userId: req.user!.id },
    });

    const completedCourses = await prisma.enrollment.count({
      where: { userId: req.user!.id, completed: true },
    });

    // Get achievements count
    const achievementsUnlocked = await prisma.userAchievement.count({
      where: { userId: req.user!.id },
    });

    res.json({
      status: 'success',
      data: {
        stats: {
          xp: user.xp,
          level: user.level,
          coins: user.coins,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastActiveAt: user.lastActiveAt,
          memberSince: user.createdAt,
          lessonsCompleted: totalLessonsCompleted,
          totalTimeSpent: totalTimeSpent._sum.timeSpent || 0,
          enrolledCourses,
          completedCourses,
          achievementsUnlocked,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get user profile
userRouter.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        xp: true,
        level: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
});

// Update user avatar
userRouter.patch('/avatar', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar },
      select: { id: true, avatar: true },
    });

    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
});