import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const gamesRouter = Router();

// Get all available games
gamesRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { title: 'asc' },
    });

    // Get user's best scores
    const userScores = await prisma.gameScore.findMany({
      where: { userId: req.user!.id },
      select: { gameId: true, score: true },
    });

    const scoreMap = new Map(userScores.map((s) => [s.gameId, s.score]));

    const gamesWithScores = games.map((game) => ({
      id: game.id,
      key: game.key,
      title: game.title,
      description: game.description,
      icon: game.icon,
      xpReward: game.xpReward,
      config: game.config,
      bestScore: scoreMap.get(game.id) || null,
    }));

    res.json({ status: 'success', data: { games: gamesWithScores } });
  } catch (err) {
    next(err);
  }
});

// Submit game score
gamesRouter.post('/:id/score', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ status: 'error', message: 'Score inválido' });
    }

    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
    });

    if (!game) {
      return res.status(404).json({ status: 'error', message: 'Juego no encontrado' });
    }

    // Get existing score
    const existingScore = await prisma.gameScore.findUnique({
      where: { userId_gameId: { userId: req.user!.id, gameId: game.id } },
    });

    const isNewHighScore = !existingScore || score > existingScore.score;

    const gameScore = existingScore
      ? await prisma.gameScore.update({
          where: { id: existingScore.id },
          data: { score, completedAt: new Date() },
        })
      : await prisma.gameScore.create({
          data: {
            userId: req.user!.id,
            gameId: game.id,
            score,
          },
        });

    // Award XP for completing the game (once per day max)
    if (isNewHighScore) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const alreadyEarnedToday = await prisma.lessonProgress.findFirst({
        where: {
          userId: req.user!.id,
          completedAt: { gte: today },
        },
      });

      if (!alreadyEarnedToday) {
        await prisma.user.update({
          where: { id: req.user!.id },
          data: {
            xp: { increment: game.xpReward },
            coins: { increment: Math.floor(game.xpReward / 5) },
          },
        });
      }
    }

    res.json({
      status: 'success',
      data: {
        gameScore: {
          score: gameScore.score,
          isNewHighScore,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});