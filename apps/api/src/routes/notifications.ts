import { Router } from 'express';
import { subscribeUser, unsubscribeUser, getConnectionCount } from '../services/notifications.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { prisma } from '../lib/prisma.js';

export const notificationsRouter = Router();

// SSE endpoint for real-time notifications
notificationsRouter.get('/stream', authenticate, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffer', 'no'); // Disable buffering for nginx
  
  // Send initial connection message
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to notification stream' })}\n\n`);
  
  // Subscribe user to notifications
  subscribeUser(userId, res);
  
  // Handle client disconnect
  req.on('close', () => {
    unsubscribeUser(userId, res);
  });
  
  // Keepalive ping every 30 seconds
  const pingInterval = setInterval(() => {
    if (res.writable) {
      res.write(`: ping\n\n`);
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
  
  // Clean up on connection close
  res.on('close', () => {
    clearInterval(pingInterval);
    unsubscribeUser(userId, res);
  });
});

// Get user's notifications (with optional unread filter)
notificationsRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { unread } = req.query;
    
    const where: any = { userId };
    if (unread === 'true') {
      where.readAt = null;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    res.json({
      status: 'success',
      data: { notifications },
    });
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
notificationsRouter.post('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;
    
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
    
    res.json({
      status: 'success',
      data: { notification },
    });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
notificationsRouter.post('/read-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    
    res.json({
      status: 'success',
      data: { message: 'All notifications marked as read' },
    });
  } catch (err) {
    next(err);
  }
});

// Get connection stats (admin only)
notificationsRouter.get('/stats', authenticate, (req: AuthRequest, res) => {
  res.json({
    status: 'success',
    data: {
      activeConnections: getConnectionCount(),
    },
  });
});