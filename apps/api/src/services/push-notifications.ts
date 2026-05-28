import webpush from 'web-push';
import { prisma } from '../lib/prisma.js';

// Configure VAPID keys from environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:notifications@duobijac.com';

// Configure web-push if keys are available
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[Push] VAPID keys configured');
} else {
  console.warn('[Push] VAPID keys not configured - push notifications will not work');
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Send push notification to a specific user
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { success: false, error: 'VAPID keys not configured' };
  }

  try {
    // Get user's push subscription
    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      return { success: false, error: 'No subscription found for user' };
    }

    // Build push subscription object for web-push
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    // Prepare notification data
    const notificationData = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag || 'duobijac-notification',
      data: payload.data || {},
    };

    // Send push notification
    await webpush.sendNotification(
      pushSubscription as webpush.PushSubscription,
      JSON.stringify(notificationData)
    );

    console.log(`[Push] Notification sent to user ${userId}: ${payload.title}`);
    return { success: true };
  } catch (error: unknown) {
    // Handle specific web-push errors
    if (error instanceof Error) {
      if ('statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        console.error(`[Push] Failed to send notification (${statusCode}):`, error.message);
        
        // If subscription is invalid (410 Gone), remove it
        if (statusCode === 410 || statusCode === 404) {
          await prisma.pushSubscription.deleteMany({
            where: { endpoint: (error as { endpoint?: string }).endpoint || '' },
          }).catch(() => {});
          return { success: false, error: 'Subscription expired, removed from database' };
        }
      }
      console.error('[Push] Send notification error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error' };
  }
}

// Send push notification to all subscribed users (for broadcasts)
export async function sendBroadcastNotification(
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { success: 0, failed: 0 };
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany();

    let success = 0;
    let failed = 0;

    const notificationData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag || 'duobijac-broadcast',
      data: payload.data || {},
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          } as webpush.PushSubscription,
          notificationData
        );
        success++;
      } catch (err) {
        failed++;
        // Remove invalid subscriptions
        if (err instanceof Error && 'statusCode' in err && ((err as { statusCode: number }).statusCode === 410 || (err as { statusCode: number }).statusCode === 404)) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }

    console.log(`[Push] Broadcast sent: ${success} success, ${failed} failed`);
    return { success, failed };
  } catch (error) {
    console.error('[Push] Broadcast error:', error);
    return { success: 0, failed: 0 };
  }
}

// Get VAPID public key for frontend subscription
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}