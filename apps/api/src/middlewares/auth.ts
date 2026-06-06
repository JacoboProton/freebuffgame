import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'duobijac-dev-secret-change-in-production';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'admin-secret-change-in-production';

// Custom user type for authentication context
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Use 'any' to bypass Express/Prisma User type conflicts
// The middleware correctly sets req.user at runtime
export type AuthRequest = any;

interface VerifyUserOptions {
  /** If true, auto-create user from Clerk data when not found in DB (default: false) */
  autoCreate?: boolean;
  /** If true, return expired-token info instead of null (for authenticate) */
  detectExpired?: boolean;
}

interface VerifyUserResult {
  user: AuthUser | null;
  expired?: boolean;
}

/**
 * Shared token verification logic used by both authenticate and optionalAuth.
 * Extracts the token, tries JWT verification, then Clerk verification.
 * Returns the authenticated user (or null).
 */
async function verifyUser(token: string | undefined, req: Request, options: VerifyUserOptions = {}): Promise<VerifyUserResult> {
  const { autoCreate = false, detectExpired = false } = options;
  if (!token) return { user: null };

  // 1) Try JWT verification (our app's JWT from email/password login)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user) return { user: { id: user.id, email: user.email, role: user.role } };
  } catch { /* JWT failed, continue to Clerk */ }

  // 2) Try Clerk verification (for Google/Clerk OAuth users)
  if (CLERK_SECRET_KEY && token.includes('_') && token.split('.').length === 3) {
    try {
      const sessionClaims = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
      if (sessionClaims && typeof sessionClaims === 'object') {
        const claims = sessionClaims as Record<string, unknown>;
        let email = claims.email as string | undefined;
        const clerkUserId = claims.sub as string;

        // If no email in token, fetch from Clerk API
        if (!email && clerkUserId) {
          try {
            const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
            const clerkUser = await clerk.users.getUser(clerkUserId);
            email = clerkUser.emailAddresses[0]?.emailAddress;
            // Fetch full profile for auto-creation
            if (!email) return { user: null };
            if (autoCreate) {
              const existingUser = await prisma.user.findUnique({ where: { email } });
              if (existingUser) return { user: { id: existingUser.id, email: existingUser.email, role: existingUser.role } };
              const name = (clerkUser.fullName || claims.name || claims.given_name || email.split('@')[0]) as string;
              const avatar = (clerkUser.imageUrl || claims.image_url || claims.avatar_url) as string | undefined;
              const created = await prisma.user.upsert({
                where: { email },
                update: {},
                create: { email, name: name || email.split('@')[0], avatar, isRegisteredWithGoogle: true },
              });
              return { user: { id: created.id, email: created.email, role: created.role } };
            }
          } catch { /* continue */ }
        }

        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) return { user: { id: user.id, email: user.email, role: user.role } };

          // Auto-create user from Clerk data if option enabled
          if (autoCreate) {
            const name = (claims.name || claims.given_name || email.split('@')[0]) as string;
            const avatar = (claims.image_url || claims.avatar_url) as string | undefined;
            const created = await prisma.user.upsert({
              where: { email },
              update: {},
              create: { email, name: name || email.split('@')[0], avatar, isRegisteredWithGoogle: true },
            });
            return { user: { id: created.id, email: created.email, role: created.role } };
          }
        }
      }
    } catch (err) {
      // Detect expired Clerk tokens for authenticate
      if (detectExpired && err && typeof err === 'object' && 'reason' in err && (err as { reason: string }).reason === 'token-expired') {
        return { user: null, expired: true };
      }
    }
  }

  return { user: null };
}

/**
 * Extract token from request cookies or Authorization header.
 */
function extractToken(req: Request): string | undefined {
  return req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    // Check for admin token — allows admin access without regular user token
    const adminToken = req.cookies?.adminToken || req.headers['x-admin-token'];
    if (!token && adminToken) {
      try {
        const decoded = jwt.verify(adminToken, ADMIN_TOKEN_SECRET) as { type: string; verified: boolean };
        if (decoded.type === 'admin_access' && decoded.verified) {
          (req as AuthRequest).user = { id: 'admin-session', email: 'admin@local', role: 'admin' };
          return next();
        }
      } catch { /* admin token invalid, continue to normal auth */ }
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
    }

    // authenticate: auto-creates Clerk users, detects expired tokens
    const { user, expired } = await verifyUser(token, req, { autoCreate: true, detectExpired: true });
    if (user) {
      (req as AuthRequest).user = user;
      return next();
    }

    if (expired) {
      return res.status(401).json({
        status: 'error',
        message: 'Sesión expirada',
        code: 'TOKEN_EXPIRED',
        action: 'refresh_session',
      });
    }

    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  } catch (err) {
    console.error('[AUTH] Unexpected auth error:', err);
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  // optionalAuth: looks up existing users only, never auto-creates
  try {
    const token = extractToken(req);
    const { user } = await verifyUser(token, req, { autoCreate: false });
    if (user) (req as AuthRequest).user = user;
  } catch { /* silently continue without user */ }
  return next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // First check if user has admin role from regular authentication
  if ((req as AuthRequest).user?.role === 'admin') {
    return next();
  }
  
  // Second check: verify admin token cookie (set after password verification)
  const adminToken = req.cookies?.adminToken;
  if (adminToken) {
    try {
      // Use already-imported jwt module
      const decoded = jwt.verify(adminToken, ADMIN_TOKEN_SECRET) as { type: string; verified: boolean };
      if (decoded.type === 'admin_access' && decoded.verified) {
        // Set a temporary admin user for the request
        (req as AuthRequest).user = (req as AuthRequest).user || { id: 'admin-session', email: 'admin@local', role: 'admin' };
        (req as AuthRequest).user.role = 'admin';
        return next();
      }
    } catch (err) {
      // Admin token invalid or expired, continue to deny
    }
  }
  
  return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};