import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authenticate, generateToken, AuthRequest } from '../middlewares/auth.js';
import { RegisterSchema, LoginSchema } from '@duobijac/shared';
import { AppError } from '../middlewares/error.js';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);
    
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('El email ya está registrado', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
});

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Update last active and check streak
    const lastActive = new Date(user.lastActiveAt);
    const now = new Date();
    const dayDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = user.currentStreak;
    if (dayDiff === 1) {
      newStreak += 1;
    } else if (dayDiff > 1) {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now, currentStreak: newStreak, longestStreak: newLongestStreak },
    });

    const token = generateToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          xp: user.xp,
          level: user.level,
          coins: user.coins,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Logout
authRouter.post('/logout', (_, res) => {
  res.clearCookie('token');
  res.json({ status: 'success', message: 'Sesión cerrada' });
});

// Get current user
authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
        role: true,
        createdAt: true,
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