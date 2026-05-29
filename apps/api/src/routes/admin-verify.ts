import { Router } from 'express';
import crypto from 'crypto';

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
      return res.json({ 
        status: 'success', 
        valid: true,
        message: 'Access granted' 
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