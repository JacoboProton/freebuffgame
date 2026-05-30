import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const weeklyLeaderboardRouter = Router();

// Get current week dates
function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
  
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

// Get weekly leaderboard
weeklyLeaderboardRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { weekStart, weekEnd } = getWeekBounds();
    const { limit = 50 } = req.query;

    // Get top users by weekly XP
    const users = await prisma.user.findMany({
      where: { 
        role: 'user',
        weeklyXpUpdated: { gte: weekStart }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        weeklyXp: true,
        level: true
      },
      orderBy: { weeklyXp: 'desc' },
      take: Number(limit)
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      weeklyXp: user.weeklyXp,
      level: user.level,
      isCurrentUser: user.id === req.user!.id
    }));

    // Get current user's rank if not in top
    let userRank = null;
    if (!leaderboard.find(e => e.isCurrentUser)) {
      const userWeeklyXp = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { weeklyXp: true }
      });

      if (userWeeklyXp && userWeeklyXp.weeklyXp > 0) {
        const usersAbove = await prisma.user.count({
          where: { 
            role: 'user',
            weeklyXp: { gt: userWeeklyXp.weeklyXp },
            weeklyXpUpdated: { gte: weekStart }
          }
        });

        const currentUserData = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { id: true, name: true, avatar: true, weeklyXp: true, level: true }
        });

        if (currentUserData) {
          userRank = {
            rank: usersAbove + 1,
            ...currentUserData,
            isCurrentUser: true
          };
        }
      }
    }

    // Get user's pending reward if any
    const pendingReward = await prisma.weeklyReward.findFirst({
      where: { 
        userId: req.user!.id,
        weekStart,
        isClaimed: false
      }
    });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        userRank,
        weekStart,
        weekEnd,
        pendingReward,
        topThree: leaderboard.slice(0, 3)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update weekly XP (called when user earns XP)
weeklyLeaderboardRouter.post('/xp', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { xp } = req.body;
    const userId = req.user!.id;

    if (!xp || xp <= 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid XP amount' });
    }

    // Get week start
    const { weekStart } = getWeekBounds();

    // Update user's weekly XP
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        weeklyXp: { increment: xp },
        weeklyXpUpdated: new Date()
      }
    });

    res.json({
      status: 'success',
      data: {
        weeklyXp: user.weeklyXp,
        totalXp: user.xp
      }
    });
  } catch (err) {
    next(err);
  }
});

// Claim weekly reward
weeklyLeaderboardRouter.post('/claim', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { weekStart } = getWeekBounds();
    const userId = req.user!.id;

    // Find unclaimed reward
    const reward = await prisma.weeklyReward.findFirst({
      where: { 
        userId,
        weekStart,
        isClaimed: false
      }
    });

    if (!reward) {
      return res.status(404).json({ status: 'error', message: 'No reward to claim' });
    }

    // Mark as claimed and give rewards
    await prisma.weeklyReward.update({
      where: { id: reward.id },
      data: { isClaimed: true, claimedAt: new Date() }
    });

    // Give XP and coins to user
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: reward.xpEarned },
        coins: { increment: reward.coinsEarned }
      }
    });

    res.json({
      status: 'success',
      data: {
        xpEarned: reward.xpEarned,
        coinsEarned: reward.coinsEarned,
        badge: reward.badgeEarned
      }
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Generate weekly rewards
weeklyLeaderboardRouter.post('/generate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const { weekStart } = getWeekBounds();
    const { weekEnd } = getWeekBounds();

    // Get top 10 users
    const topUsers = await prisma.user.findMany({
      where: { role: 'user', weeklyXp: { gt: 0 } },
      orderBy: { weeklyXp: 'desc' },
      take: 10
    });

    const rewards = [
      { rank: 1, xp: 500, coins: 100, badge: 'weekly_champion' },
      { rank: 2, xp: 300, coins: 75, badge: 'weekly_runner_up' },
      { rank: 3, xp: 200, coins: 50, badge: 'weekly_bronze' },
      { rank: 4, xp: 150, coins: 30, badge: null },
      { rank: 5, xp: 100, coins: 25, badge: null },
      { rank: 6, xp: 75, coins: 20, badge: null },
      { rank: 7, xp: 50, coins: 15, badge: null },
      { rank: 8, xp: 40, coins: 10, badge: null },
      { rank: 9, xp: 30, coins: 8, badge: null },
      { rank: 10, xp: 20, coins: 5, badge: null }
    ];

    const createdRewards = [];
    for (let i = 0; i < topUsers.length; i++) {
      const rewardData = rewards[i] || { xp: 10, coins: 5, badge: null };
      
      const reward = await prisma.weeklyReward.upsert({
        where: {
          weekStart_userId: {
            weekStart,
            userId: topUsers[i].id
          }
        },
        update: {},
        create: {
          weekStart,
          weekEnd,
          userId: topUsers[i].id,
          rank: i + 1,
          xpEarned: rewardData.xp,
          coinsEarned: rewardData.coins,
          badgeEarned: rewardData.badge
        }
      });
      createdRewards.push(reward);
    }

    res.json({
      status: 'success',
      data: {
        rewards: createdRewards,
        weekStart,
        weekEnd
      }
    });
  } catch (err) {
    next(err);
  }
});