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