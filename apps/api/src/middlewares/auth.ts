import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'duobijac-dev-secret-change-in-production';// Custom user type for authentication context
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
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    // Attach our custom user object to the request
    (req as AuthRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
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