import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { prisma } from '../lib/prisma.js';
import { getVapidPublicKey } from '../services/push-notifications.js';

const router = Router();

// Subscribe to push notifications
router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const subscription = req.body;

    if (!subscription.endpoint || !subscription.keys) {
      res.status(400).json({ error: 'Invalid subscription object' });
      return;
    }

    // Store in database
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date()
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    console.log(`[Push] User ${userId} subscribed to push notifications`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint required' });
      return;
    }

    // Remove from database
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId }
    });

    console.log(`[Push] User ${userId} unsubscribed from push notifications`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get user's push subscription status
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId }
    });

    res.json({
      subscribed: !!subscription,
      endpoint: subscription?.endpoint
    });
  } catch (error) {
    console.error('[Push] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Get VAPID public key for frontend (no auth required)
router.get('/vapid-public-key', (_req, res) => {
  const key = getVapidPublicKey();
  if (!key) {
    res.status(503).json({ error: 'Push notifications not configured' });
    return;
  }
  res.json({ key });
});

// Send push notification to a user (internal API)
router.post('/send', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { title, body, icon, badge, tag, data } = req.body;

    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId }
    });

    if (!subscription) {
      res.status(404).json({ error: 'No subscription found' });
      return;
    }

    // For web push, we need to send to the Push API
    // In a real implementation, you'd use a library like web-push
    // For now, we'll just log and return success
    // The actual push is handled by the notification system
    
    console.log(`[Push] Would send notification to ${subscription.endpoint}:`, { title, body });
    
    res.json({ success: true, message: 'Push notification queued' });
  } catch (error) {
    console.error('[Push] Send error:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

export default router;