// Passport configuration - use createRequire for proper CJS module handling in ESM
import { createRequire } from 'module';
import type { AuthRequest } from '../middlewares/auth.js';
import type { Strategy as GoogleStrategyType } from 'passport-google-oauth20';

const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const passport: typeof import('passport') = require('passport');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GoogleStrategy: typeof GoogleStrategyType = require('passport-google-oauth20').Strategy;

export type { AuthRequest };

// Configure passport only if env vars are present
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  // Configure Passport Google Strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`,
  }, async (_accessToken: string, _refreshToken: string, profile: any, done: (err: Error | null, user?: any) => void) => {
    try {
      if (!profile.emails?.length) {
        return done(new Error('No email found in Google profile'));
      }

      const { prisma } = await import('../lib/prisma.js');

      const email = profile.emails[0].value;
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
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
  }));
  
  console.log('✅ Google OAuth strategy configured');
} else {
  console.warn('⚠️ Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google sign-in.');
}

export { passport };

export const isGoogleOAuthConfigured = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);