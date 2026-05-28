"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
  sendSubscriptionToBackend,
  removeSubscriptionFromBackend
} from './push-notifications';

export interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

export function usePushNotifications(): PushSubscriptionState {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (!supported) {
        setIsLoading(false);
        return;
      }

      const perm = getNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setIsLoading(false);
        return;
      }

      // Get service worker registration
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          setRegistration(reg);

          // Check if already subscribed
          const existing = await getExistingSubscription(reg);
          setIsSubscribed(!!existing);
        } catch (err) {
          console.error('[Push] Failed to get service worker registration:', err);
        }
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      setError('Service worker not registered');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const subscription = await subscribeToPush(registration);
      if (!subscription) {
        setError('Failed to subscribe - permission denied');
        setIsLoading(false);
        return false;
      }

      const success = await sendSubscriptionToBackend(subscription);
      if (success) {
        setIsSubscribed(true);
        setIsLoading(false);
        return true;
      } else {
        setError('Failed to save subscription on server');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      setError('Failed to subscribe to push notifications');
      setIsLoading(false);
      return false;
    }
  }, [registration]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      setError('Service worker not registered');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const subscription = await getExistingSubscription(registration);
      if (subscription) {
        await unsubscribeFromPush(subscription);
        await removeSubscriptionFromBackend(subscription.endpoint);
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err);
      setError('Failed to unsubscribe from push notifications');
      setIsLoading(false);
      return false;
    }
  }, [registration]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe
  };
}