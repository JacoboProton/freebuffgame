import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';

export const dailyGoalsRouter = Router();

interface DailyGoal {
  id: string;
  type: 'xp' | 'lessons' | 'streak' | 'games';
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

interface GoalStats {
  todayXP: number;
  todayLessons: number;
  todayGames: number;
  isToday: boolean;
  currentStreak: number;
}

// Helper function to check if a goal is completed (avoids code duplication)
function isGoalCompleted(goalId: string, stats: GoalStats): boolean {
  switch (goalId) {
    case 'daily_xp':
      return stats.todayXP >= 50;
    case 'daily_lessons':
      return stats.todayLessons >= 3;
    case 'daily_streak':
      return stats.currentStreak > 0 && stats.isToday;
    case 'daily_games':
      return stats.todayGames >= 1;
    default:
      return false;
  }
}

// Get user's daily goals
dailyGoalsRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        currentStreak: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Get today's completed lessons count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayLessonsCompleted = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: todayStart,
        },
      },
    });

    // Get today's games played
    const todayGamesPlayed = await prisma.gameScore.count({
      where: {
        userId,
        completedAt: {
          gte: todayStart,
        },
      },
    });

    // Calculate daily XP (XP earned today based on lastActiveAt)
    // For now, we calculate based on a simple heuristic
    const isToday = new Date(user.lastActiveAt).toDateString() === todayStart.toDateString();
    const dailyXPGoal = 50;
    const dailyXPProgress = isToday ? Math.min(user.xp % 500, dailyXPGoal) : 0;

    // Build stats object for helper function
    const stats: GoalStats = {
      todayXP: dailyXPProgress,
      todayLessons: todayLessonsCompleted,
      todayGames: todayGamesPlayed,
      isToday,
      currentStreak: user.currentStreak,
    };

    // Build daily goals using helper function
    const dailyGoals: DailyGoal[] = [
      {
        id: 'daily_xp',
        type: 'xp',
        title: 'Meta diaria de XP',
        description: `Ganar ${dailyXPGoal} XP hoy`,
        target: dailyXPGoal,
        current: dailyXPProgress,
        xpReward: 20,
        completed: isGoalCompleted('daily_xp', stats),
      },
      {
        id: 'daily_lessons',
        type: 'lessons',
        title: 'Lecciones completadas',
        description: 'Completar 3 lecciones hoy',
        target: 3,
        current: todayLessonsCompleted,
        xpReward: 30,
        completed: isGoalCompleted('daily_lessons', stats),
      },
      {
        id: 'daily_streak',
        type: 'streak',
        title: 'Mantén tu racha',
        description: 'Inicia sesión y aprende algo hoy',
        target: 1,
        current: user.currentStreak > 0 && isToday ? 1 : 0,
        xpReward: 15,
        completed: isGoalCompleted('daily_streak', stats),
      },
      {
        id: 'daily_games',
        type: 'games',
        title: 'Juega un minijuego',
        description: 'Completa al menos 1 minijuego',
        target: 1,
        current: todayGamesPlayed,
        xpReward: 25,
        completed: isGoalCompleted('daily_games', stats),
      },
    ];

    // Calculate total XP available from daily goals
    const totalXP = dailyGoals.reduce((acc, goal) => acc + goal.xpReward, 0);
    const completedGoals = dailyGoals.filter(g => g.completed).length;
    const earnedXP = dailyGoals.filter(g => g.completed).reduce((acc, g) => acc + g.xpReward, 0);

    res.json({
      status: 'success',
      data: {
        dailyGoals,
        summary: {
          totalGoals: dailyGoals.length,
          completedGoals,
          totalXP,
          earnedXP,
          allCompleted: completedGoals === dailyGoals.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Claim daily goal reward
dailyGoalsRouter.post('/claim/:goalId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { goalId } = req.params;
    const userId = req.user!.id;

    const validGoalIds = ['daily_xp', 'daily_lessons', 'daily_streak', 'daily_games'];
    if (!validGoalIds.includes(goalId)) {
      throw new AppError('Meta diaria no válida', 400);
    }

    // Get the goal's XP reward
    const xpRewards: Record<string, number> = {
      daily_xp: 20,
      daily_lessons: 30,
      daily_streak: 15,
      daily_games: 25,
    };

    const xpReward = xpRewards[goalId];
    if (!xpReward) {
      throw new AppError('Meta no encontrada', 404);
    }

    // Check if user already claimed this goal today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use LessonProgress as a log for claimed daily goals
    const existingClaim = await prisma.lessonProgress.findFirst({
      where: {
        userId,
        lessonId: goalId, // Using lessonId to store goalId temporarily
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingClaim) {
      throw new AppError('Ya reclamaste esta meta hoy', 400);
    }

    // Verify the goal is actually completed before awarding
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        currentStreak: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Get today's stats to verify completion
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayLessonsCompleted = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        completedAt: { gte: todayStart },
      },
    });

    const todayGamesPlayed = await prisma.gameScore.count({
      where: {
        userId,
        completedAt: { gte: todayStart },
      },
    });

    const isToday = new Date(user.lastActiveAt).toDateString() === todayStart.toDateString();

    // Build stats and verify goal completion using helper
    const stats: GoalStats = {
      todayXP: isToday ? Math.min(user.xp % 500, 50) : 0,
      todayLessons: todayLessonsCompleted,
      todayGames: todayGamesPlayed,
      isToday,
      currentStreak: user.currentStreak,
    };

    if (!isGoalCompleted(goalId, stats)) {
      throw new AppError('Completa la meta primero antes de reclamar la recompensa', 400);
    }

    // Update user's XP
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpReward },
        coins: { increment: Math.floor(xpReward / 5) },
      },
      select: {
        xp: true,
        coins: true,
        level: true,
      },
    });

    // Log the claim to prevent double-claiming
    await prisma.lessonProgress.create({
      data: {
        userId,
        lessonId: goalId, // Using lessonId as a temporary storage key
        score: xpReward,
        xpEarned: xpReward,
        completed: true,
        completedAt: new Date(),
      },
    });

    res.json({
      status: 'success',
      data: {
        claimed: true,
        goalId,
        xpEarned: xpReward,
        coinsEarned: Math.floor(xpReward / 5),
        user: {
          xp: updatedUser.xp,
          coins: updatedUser.coins,
          level: updatedUser.level,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});