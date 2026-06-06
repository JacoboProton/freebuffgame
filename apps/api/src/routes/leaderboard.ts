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
import { LEGENDARY_KEYS, FINAL_EXAM_LESSON_IDS } from '../lib/legendary.js';

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

// Speed Masters leaderboard: users who unlocked speed_master, ranked by fastest time
leaderboardRouter.get('/speed-masters', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { period = 'all' } = req.query;

    // Find the speed_master achievement
    const speedAchievement = await prisma.achievement.findUnique({
      where: { key: 'speed_master' },
    });

    if (!speedAchievement) {
      return res.json({ status: 'success', data: { leaderboard: [], totalSpeedMasters: 0, achievement: null } });
    }

    // Build date filter based on period
    let dateFilter = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { unlockedAt: { gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { unlockedAt: { gte: monthAgo } };
    }

    // Get users who unlocked speed_master, optionally filtered by period
    const userAchievements = await prisma.userAchievement.findMany({
      where: { achievementId: speedAchievement.id, ...dateFilter },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, xp: true, level: true },
        },
      },
      orderBy: { unlockedAt: 'asc' },
    });

    // For each user, calculate their total time on final exams
    const leaderboard = await Promise.all(
      userAchievements.map(async (ua, index) => {
        const timeAgg = await prisma.lessonProgress.aggregate({
          where: { userId: ua.userId, lessonId: { in: FINAL_EXAM_LESSON_IDS } },
          _sum: { timeSpent: true },
        });
        const totalTimeSeconds = timeAgg._sum.timeSpent || 0;
        const avgTimePerExam = Math.round(totalTimeSeconds / FINAL_EXAM_LESSON_IDS.length);

        return {
          rank: 0, // will be set after sorting
          userId: ua.user.id,
          name: ua.user.name,
          avatar: ua.user.avatar,
          xp: ua.user.xp,
          level: ua.user.level,
          totalTimeSeconds,
          totalTimeMinutes: Math.round(totalTimeSeconds / 60),
          avgTimePerExamSeconds: avgTimePerExam,
          avgTimePerExamFormatted: `${Math.floor(avgTimePerExam / 60)}m ${avgTimePerExam % 60}s`,
          unlockedAt: ua.unlockedAt,
          isCurrentUser: ua.userId === req.user!.id,
        };
      })
    );

    // Sort by fastest total time (ascending)
    leaderboard.sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds);
    leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        totalSpeedMasters: leaderboard.length,
        achievement: {
          key: speedAchievement.key,
          title: speedAchievement.title,
          description: speedAchievement.description,
          icon: speedAchievement.icon,
          xpReward: speedAchievement.xpReward,
        },
        thresholdMinutes: 60,
        period,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Code Masters leaderboard: users who unlocked code_master, ranked by completion percentage
leaderboardRouter.get('/code-masters', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Find the code_master achievement
    const codeAchievement = await prisma.achievement.findUnique({
      where: { key: 'code_master' },
    });

    if (!codeAchievement) {
      return res.json({ status: 'success', data: { leaderboard: [], totalCodeMasters: 0, achievement: null } });
    }

    // Get all coding/project lessons total
    const totalCodingLessons = await prisma.lesson.count({
      where: { type: { in: ['coding', 'project'] } },
    });

    // Get all users who unlocked code_master
    const userAchievements = await prisma.userAchievement.findMany({
      where: { achievementId: codeAchievement.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, xp: true, level: true },
        },
      },
      orderBy: { unlockedAt: 'asc' },
    });

    // For each user, calculate their coding/project lesson completion
    const leaderboard = await Promise.all(
      userAchievements.map(async (ua) => {
        const completedCoding = await prisma.lessonProgress.count({
          where: {
            userId: ua.userId,
            completed: true,
            lesson: { type: { in: ['coding', 'project'] } },
          },
        });

        const percentage = totalCodingLessons > 0 ? Math.round((completedCoding / totalCodingLessons) * 100) : 0;
        const avgScore = await prisma.lessonProgress.aggregate({
          where: {
            userId: ua.userId,
            completed: true,
            lesson: { type: { in: ['coding', 'project'] } },
          },
          _avg: { score: true },
        });

        return {
          rank: 0,
          userId: ua.user.id,
          name: ua.user.name,
          avatar: ua.user.avatar,
          xp: ua.user.xp,
          level: ua.user.level,
          completedCodingLessons: completedCoding,
          totalCodingLessons,
          percentage,
          avgScore: Math.round(avgScore._avg.score || 0),
          unlockedAt: ua.unlockedAt,
          isCurrentUser: ua.userId === req.user!.id,
        };
      })
    );

    // Sort by percentage descending (most complete first), then by earliest unlock
    leaderboard.sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.unlockedAt.getTime() - b.unlockedAt.getTime();
    });
    leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        totalCodeMasters: leaderboard.length,
        achievement: {
          key: codeAchievement.key,
          title: codeAchievement.title,
          description: codeAchievement.description,
          icon: codeAchievement.icon,
          xpReward: codeAchievement.xpReward,
        },
        totalCodingLessons,
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