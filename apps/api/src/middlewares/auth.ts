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

// Middleware factory that returns proper Express handler
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    console.log('[AUTH DEBUG] Token present:', !!token);
    console.log('[AUTH DEBUG] CLERK_SECRET_KEY set:', !!CLERK_SECRET_KEY, CLERK_SECRET_KEY?.substring(0, 20) + '...');
    console.log('[AUTH DEBUG] Cookie token:', req.cookies?.token ? 'yes (' + req.cookies.token.substring(0, 30) + '...)' : 'no');
    console.log('[AUTH DEBUG] Auth header:', req.headers.authorization ? 'yes (' + req.headers.authorization.substring(0, 30) + '...)' : 'no');

    // Check for admin token cookie - allows admin access without regular user token
    const adminToken = req.cookies?.adminToken;
    if (!token && adminToken) {
      try {
        const decoded = jwt.verify(adminToken, ADMIN_TOKEN_SECRET) as { type: string; verified: boolean };
        if (decoded.type === 'admin_access' && decoded.verified) {
          console.log('[AUTH DEBUG] Admin token cookie detected and valid');
          (req as AuthRequest).user = { id: 'admin-session', email: 'admin@local', role: 'admin' };
          return next();
        }
      } catch (err) {
        console.log('[AUTH DEBUG] Admin token cookie invalid');
        // Continue to normal auth flow
      }
    }

    if (!token) {
      console.log('[AUTH DEBUG] No token found - returning 401');
      return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
    }

    // FIRST: Try JWT verification (our app's JWT from email/password login)
    try {
      console.log('[AUTH DEBUG] Trying JWT verification...');
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (user) {
        console.log('[AUTH DEBUG] JWT verified successfully for user:', user.email);
        (req as AuthRequest).user = { id: user.id, email: user.email, role: user.role };
        return next();
      }
    } catch (err) {
      console.log('[AUTH DEBUG] JWT verification failed:', err instanceof Error ? err.message : 'unknown error');
      // JWT verification failed, continue to Clerk verification
    }

    // SECOND: Try Clerk verification (for Google/Clerk OAuth users)
    console.log('[AUTH DEBUG] Token structure check:', {
      hasUnderscore: token.includes('_'),
      parts: token.split('.').length
    });

    if (CLERK_SECRET_KEY && token.includes('_') && token.split('.').length === 3) {
      console.log('[AUTH DEBUG] Attempting Clerk verification...');
      try {
        // Use Clerk's verifyToken to verify the token
        const sessionClaims = await verifyToken(token, {
          secretKey: CLERK_SECRET_KEY,
        });

        console.log('[AUTH DEBUG] Clerk verification result:', JSON.stringify(sessionClaims));

        if (sessionClaims && typeof sessionClaims === 'object') {
          // Clerk tokens contain sub (user ID) but not always email in JWT claims
          const claims = sessionClaims as Record<string, unknown>;
          let email = claims.email as string | undefined;
          const clerkUserId = claims.sub as string;

          // If no email in token, fetch from Clerk API using user ID
          let clerkUser = null;
          if (!email && clerkUserId) {
            console.log('[AUTH DEBUG] No email in token, fetching from Clerk API...');
            try {
              const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
              clerkUser = await clerk.users.getUser(clerkUserId);
              email = clerkUser.emailAddresses[0]?.emailAddress;
              console.log('[AUTH DEBUG] Email from Clerk API:', email);
            } catch (clerkErr) {
              console.error('[AUTH DEBUG] Error fetching Clerk user:', clerkErr);
            }
          }

          if (email) {
            console.log('[AUTH DEBUG] Clerk email found:', email);
            let user = await prisma.user.findUnique({ where: { email } });
            
            // If user doesn't exist, create them automatically from Clerk data
            if (!user) {
              console.log('Creating new user from Clerk data:', email, 'Clerk sub:', clerkUserId);
              // Get name/avatar from Clerk user object if we fetched it, or from token claims
              let name = (clerkUser?.fullName || claims.name || claims.given_name || email.split('@')[0]) as string;
              let avatar: string | undefined = (clerkUser?.imageUrl || claims.image_url || claims.avatar_url) as string | undefined;
              
              user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                  email,
                  name: name || email.split('@')[0],
                  avatar,
                  isRegisteredWithGoogle: true,
                },
              });
            }
            
            (req as AuthRequest).user = { id: user.id, email: user.email, role: user.role };
            console.log('[AUTH DEBUG] Clerk auth successful for user:', user.email);
            return next();
          } else {
            console.log('[AUTH DEBUG] No email found - cannot authenticate:', JSON.stringify(claims));
          }
        }
      } catch (err) {
        console.error('[AUTH DEBUG] Clerk verification error:', err);
      }
    } else {
      console.log('[AUTH DEBUG] Skipping Clerk verification - conditions not met:', {
        hasClerkSecret: !!CLERK_SECRET_KEY,
        hasUnderscore: token.includes('_'),
        has3Parts: token.split('.').length === 3
      });
    }

    // Both verification methods failed
    console.log('[AUTH DEBUG] All verification methods failed - returning 401');
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  } catch (err) {
    console.error('[AUTH DEBUG] Unexpected auth error:', err);
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }
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