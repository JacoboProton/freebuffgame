import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth';
import { prisma } from '../lib/prisma';

export const notificationsRouter = Router();

// Subscribe to push notifications
notificationsRouter.post('/subscribe', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const subscription = req.body; // { endpoint, keys: { p256dh, auth } }

    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ status: 'error', message: 'Invalid subscription data' });
    }

    // Upsert push subscription
    await prisma.pushSubscription.upsert({
      where: {
        userId: userId,
      },
      update: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    res.json({ status: 'success', message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ status: 'error', message: 'Failed to subscribe' });
  }
});

// Unsubscribe from push notifications
notificationsRouter.post('/unsubscribe', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ status: 'error', message: 'Invalid endpoint' });
    }

    // Delete push subscription
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: userId,
        endpoint: endpoint,
      },
    });

    res.json({ status: 'success', message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    res.status(500).json({ status: 'error', message: 'Failed to unsubscribe' });
  }
});

// Get user's push subscription status
notificationsRouter.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId: userId },
    });

    res.json({ 
      status: 'success', 
      data: { 
        isSubscribed: !!subscription,
        endpoint: subscription?.endpoint,
      } 
    });
  } catch (error) {
    console.error('Error getting push status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get status' });
  }
});

// Send push notification (internal API for triggering notifications)
notificationsRouter.post('/send', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId: userId },
    });

    if (!subscription) {
      return res.status(404).json({ status: 'error', message: 'No subscription found' });
    }

    // In production, you would send the push notification here using web-push library
    // For now, just log it
    console.log(`[Push Notification] To: ${userId}, Title: ${title}, Body: ${body}`);

    // Store notification in database
    await prisma.notification.create({
      data: {
        userId: userId,
        title: title,
        message: body,
        type: 'push',
        isRead: false,
        metadata: data ? JSON.stringify(data) : null,
      },
    });

    res.json({ status: 'success', message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send notification' });
  }
});

export default notificationsRouter;