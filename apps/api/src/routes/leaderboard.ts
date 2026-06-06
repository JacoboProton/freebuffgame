import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { XP_PER_LEVEL } from '@duobijac/shared';

export const leaderboardRouter = Router();

// Get global leaderboard
leaderboardRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { period = 'all', limit = 50 } = req.query;

    let dateFilter = {};
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastActiveAt: { gte: weekAgo } };
    }

    const users = await prisma.user.findMany({
      where: { role: 'user', ...dateFilter },
      select: {
        id: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
      },
      orderBy: { xp: 'desc' },
      take: Number(limit),
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      isCurrentUser: user.id === req.user!.id,
    }));

    // Find current user's rank if not in top
    let userRank = null;
    if (!leaderboard.find((e) => e.isCurrentUser)) {
      const userPosition = await prisma.user.count({
        where: { xp: { gt: (await prisma.user.findUnique({ where: { id: req.user!.id }, select: { xp: true } }))?.xp || 0 }, role: 'user' },
      });

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, avatar: true, xp: true, level: true },
      });

      if (currentUser) {
        userRank = {
          rank: userPosition + 1,
          userId: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          xp: currentUser.xp,
          level: currentUser.level,
          isCurrentUser: true,
        };
      }
    }

    res.json({
      status: 'success',
      data: {
        leaderboard,
        userRank,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get Masters leaderboard (users who unlocked 'all_final_exams' achievement)
leaderboardRouter.get('/masters', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Find the all_final_exams achievement
    const allFinalExamsAchievement = await prisma.achievement.findUnique({
      where: { key: 'all_final_exams' },
    });

    if (!allFinalExamsAchievement) {
      return res.json({ status: 'success', data: { leaderboard: [], totalMasters: 0 } });
    }

    // Get all users who unlocked this achievement, sorted by unlock date (earliest = best)
    const userAchievements = await prisma.userAchievement.findMany({
      where: { achievementId: allFinalExamsAchievement.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            xp: true,
            level: true,
          },
        },
      },
      orderBy: { unlockedAt: 'asc' },
    });

    const leaderboard = userAchievements.map((ua, index) => ({
      rank: index + 1,
      userId: ua.user.id,
      name: ua.user.name,
      avatar: ua.user.avatar,
      xp: ua.user.xp,
      level: ua.user.level,
      unlockedAt: ua.unlockedAt,
      isCurrentUser: ua.user.id === req.user!.id,
    }));

    res.json({
      status: 'success',
      data: {
        leaderboard,
        totalMasters: leaderboard.length,
        achievement: {
          key: allFinalExamsAchievement.key,
          title: allFinalExamsAchievement.title,
          description: allFinalExamsAchievement.description,
          icon: allFinalExamsAchievement.icon,
          xpReward: allFinalExamsAchievement.xpReward,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Hall of Fame: all users with at least one legendary achievement
import { LEGENDARY_KEYS } from '../lib/legendary.js';

leaderboardRouter.get('/hall-of-fame', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Find all legendary achievements
    const legendaryAchievements = await prisma.achievement.findMany({
      where: { key: { in: LEGENDARY_KEYS } },
    });

    const legendaryIds = legendaryAchievements.map(a => a.id);

    // Find all users who unlocked at least one legendary achievement
    const userAchievements = await prisma.userAchievement.findMany({
      where: { achievementId: { in: legendaryIds } },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, xp: true, level: true },
        },
        achievement: {
          select: { key: true, title: true, description: true, icon: true, xpReward: true },
        },
      },
      orderBy: { unlockedAt: 'asc' },
    });

    // Group by user
    const userMap = new Map<string, {
      userId: string;
      name: string;
      avatar: string | null;
      xp: number;
      level: number;
      totalLegendaryCount: number;
      firstLegendaryAt: Date;
      achievements: { key: string; title: string; description: string; icon: string; xpReward: number; unlockedAt: Date }[];
    }>();

    for (const ua of userAchievements) {
      const existing = userMap.get(ua.userId);
      const achievementEntry = {
        key: ua.achievement.key,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      };

      if (existing) {
        existing.achievements.push(achievementEntry);
        existing.totalLegendaryCount = existing.achievements.length;
        if (ua.unlockedAt < existing.firstLegendaryAt) {
          existing.firstLegendaryAt = ua.unlockedAt;
        }
      } else {
        userMap.set(ua.userId, {
          userId: ua.user.id,
          name: ua.user.name,
          avatar: ua.user.avatar,
          xp: ua.user.xp,
          level: ua.user.level,
          totalLegendaryCount: 1,
          firstLegendaryAt: ua.unlockedAt,
          achievements: [achievementEntry],
        });
      }
    }

    // Sort by most legendary achievements, then earliest first unlock
    const users = [...userMap.values()].sort((a, b) => {
      if (b.totalLegendaryCount !== a.totalLegendaryCount) return b.totalLegendaryCount - a.totalLegendaryCount;
      return a.firstLegendaryAt.getTime() - b.firstLegendaryAt.getTime();
    });

    const hallOfFame = users.map((user, index) => ({
      rank: index + 1,
      ...user,
      isCurrentUser: user.userId === req.user!.id,
    }));

    res.json({
      status: 'success',
      data: {
        hallOfFame,
        totalLegendaryUsers: hallOfFame.length,
        totalLegendaryAchievements: userAchievements.length,
        legendaryAchievements,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get friends leaderboard
leaderboardRouter.get('/friends', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Get user's friends
    const friends = await prisma.friend.findMany({
      where: { userId: req.user!.id },
      select: { friendId: true },
    });

    const friendIds = friends.map((f) => f.friendId);

    // Include user in the list
    const allIds = [req.user!.id, ...friendIds];

    const users = await prisma.user.findMany({
      where: { id: { in: allIds }, role: 'user' },
      select: {
        id: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
      },
      orderBy: { xp: 'desc' },
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      isCurrentUser: user.id === req.user!.id,
    }));

    res.json({ status: 'success', data: { leaderboard } });
  } catch (err) {
    next(err);
  }
});