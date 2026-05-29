import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'admin-secret-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || 'duobijac-dev-secret-change-in-production';

export const adminVerifyRouter = Router();

// Admin password verification
// POST /api/admin-auth/verify-password
adminVerifyRouter.post('/verify-password', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Password is required' 
      });
    }

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return res.status(500).json({ 
        status: 'error', 
        message: 'Server configuration error' 
      });
    }

    // Use timing-safe comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password, 'utf8');
    const adminPasswordBuffer = Buffer.from(adminPassword, 'utf8');
    
    let isValid = false;
    if (passwordBuffer.length === adminPasswordBuffer.length) {
      isValid = crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);
    }

    if (isValid) {
      // Generate a temporary admin token that will be sent to the frontend
      // The frontend will use this token to access admin endpoints
      const adminToken = jwt.sign(
        { type: 'admin_access', verified: true },
        ADMIN_TOKEN_SECRET,
        { expiresIn: '2h' } // Admin token expires in 2 hours
      );

      // Set admin token as a cookie
      res.cookie('adminToken', adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        path: '/',
      });

      return res.json({ 
        status: 'success', 
        valid: true,
        message: 'Access granted',
        adminToken // Also return in body for frontend to use
      });
    } else {
      return res.status(401).json({ 
        status: 'error', 
        valid: false,
        message: 'Incorrect password' 
      });
    }
  } catch (err) {
    next(err);
  }
});

// Verify admin token (called by frontend to check if admin access is valid)
adminVerifyRouter.get('/verify-token', (req, res) => {
  const adminToken = req.cookies?.adminToken || req.headers['x-admin-token'];
  
  if (!adminToken) {
    return res.status(401).json({ 
      status: 'error', 
      valid: false,
      message: 'No admin token' 
    });
  }

  try {
    const decoded = jwt.verify(adminToken, ADMIN_TOKEN_SECRET) as { type: string; verified: boolean };
    
    if (decoded.type === 'admin_access' && decoded.verified) {
      return res.json({ 
        status: 'success', 
        valid: true,
        message: 'Admin access valid' 
      });
    } else {
      return res.status(401).json({ 
        status: 'error', 
        valid: false,
        message: 'Invalid admin token' 
      });
    }
  } catch (err) {
    return res.status(401).json({ 
      status: 'error', 
      valid: false,
      message: 'Invalid or expired admin token' 
    });
  }
});

// Logout admin (clear admin cookie)
adminVerifyRouter.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  return res.json({ 
    status: 'success', 
    message: 'Admin session cleared' 
  });
});