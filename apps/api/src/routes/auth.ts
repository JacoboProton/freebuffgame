import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authenticate, generateToken, AuthRequest } from '../middlewares/auth.js';
import { RegisterSchema, LoginSchema } from '@duobijac/shared';
import { AppError } from '../middlewares/error.js';

// Validate Google OAuth environment variables on startup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google sign-in.');
} else {
  // Configure Passport Google Strategy
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        if (!profile.emails?.length) {
          return done(new Error('No email found in Google profile'));
        }

        const email = profile.emails[0].value;
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
          // Update googleId if not set
          if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || existingUser.avatar,
                isRegisteredWithGoogle: true,
              },
            });
          }
          return done(null, { id: existingUser.id, email: existingUser.email, name: existingUser.name });
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email,
            name: profile.displayName || email.split('@')[0],
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            isRegisteredWithGoogle: true,
          },
        });

        return done(null, { id: newUser.id, email: newUser.email, name: newUser.name });
      } catch (err) {
        return done(err as Error);
      }
    }
  ));
}

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

    // Block Google-only users from email/password login
    if (user.isRegisteredWithGoogle && !user.passwordHash) {
      throw new AppError('Este cuenta fue creada con Google. Por favor inicia sesión con Google.', 401);
    }

    if (!user.passwordHash) {
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

// Check if Google OAuth is configured
authRouter.get('/google/status', (_, res) => {
  const configured = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
  res.json({ 
    status: 'success', 
    data: { 
      googleOAuthEnabled: configured 
    } 
  });
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

// Google OAuth Routes
authRouter.get('/google', 
  (req, res, next) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Google OAuth no está configurado. Contacta al administrador.' 
      });
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    state: Math.random().toString(36).substring(7),
  })
);

authRouter.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed` 
  }),
  (req: AuthRequest, res, next) => {
    try {
      // Generate JWT token for the user
      const token = generateToken(req.user!.id);

      // Set cookie and redirect to frontend
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to dashboard
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?google_auth=success`);
    } catch (err) {
      next(err);
    }
  }
);