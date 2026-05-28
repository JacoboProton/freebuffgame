import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@clerk/backend';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'duobijac-dev-secret-change-in-production';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

// Custom user type for authentication context
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Use 'any' to bypass Express/Prisma User type conflicts
// The middleware correctly sets req.user at runtime
export type AuthRequest = any;

// Middleware factory that returns proper Express handler
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
    }

    // FIRST: Try JWT verification (our app's JWT from email/password login)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (user) {
        (req as AuthRequest).user = { id: user.id, email: user.email, role: user.role };
        return next();
      }
    } catch {
      // JWT verification failed, continue to Clerk verification
    }

    // SECOND: Try Clerk verification (for Google/Clerk OAuth users)
    if (CLERK_SECRET_KEY && token.includes('_') && token.split('.').length === 3) {
      try {
        // Use Clerk's verifyToken to verify the token
        const sessionClaims = await verifyToken(token, {
          secretKey: CLERK_SECRET_KEY,
        });

        if (sessionClaims && typeof sessionClaims === 'object') {
          // Clerk tokens contain email in the email claim
          const claims = sessionClaims as Record<string, unknown>;
          const email = claims.email as string | undefined;

          if (email) {
            let user = await prisma.user.findUnique({ where: { email } });
            
            // If user doesn't exist, create them automatically from Clerk data
            // Use upsert to handle race conditions (two requests for same new user)
            if (!user) {
              console.log('Creating new user from Clerk data:', email, 'Clerk sub:', claims.sub);
              const name = (claims.name || claims.given_name || email.split('@')[0]) as string;
              const avatar = (claims.image_url || claims.avatar_url) as string | undefined;
              
              user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                  email,
                  name,
                  avatar,
                  isRegisteredWithGoogle: true,
                },
              });
            }
            
            (req as AuthRequest).user = { id: user.id, email: user.email, role: user.role };
            return next();
          } else {
            console.log('No email in Clerk session claims:', JSON.stringify(claims));
          }
        }
      } catch (err) {
        console.error('Clerk verification error:', err);
      }
    }

    // Both verification methods failed
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  } catch {
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as AuthRequest).user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
  }
  next();
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};