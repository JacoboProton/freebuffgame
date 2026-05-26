import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const achievementsRouter = Router();

// Get all achievements with user's unlocked status
achievementsRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { key: 'asc' },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.user!.id },
      select: { achievementId: true, unlockedAt: true },
    });

    const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

    const achievementsWithStatus = achievements.map((achievement) => ({
      id: achievement.id,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
      unlockedAt: unlockedMap.get(achievement.id) || null,
    }));

    const unlockedCount = achievementsWithStatus.filter((a) => a.unlockedAt).length;

    res.json({
      status: 'success',
      data: {
        achievements: achievementsWithStatus,
        unlockedCount,
        totalCount: achievements.length,
      },
    });
  } catch (err) {
    next(err);
  }
});