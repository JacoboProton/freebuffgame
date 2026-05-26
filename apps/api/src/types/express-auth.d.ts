import { AuthUser } from '../middlewares/auth.js';

// Augment Express Request to use our AuthUser type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};