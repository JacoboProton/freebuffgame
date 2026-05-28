"use client";

import { useEffect, useRef } from 'react';
import { usePushNotifications } from '@/lib/use-push-notifications';
import { VAPID_PUBLIC_KEY } from '@/lib/push-notifications';

export function PushProvider({ children }: { children: React.ReactNode }) {
  const { subscribe } = usePushNotifications();
  const hasRegistered = useRef(false);

  // Register service worker on mount (only once)
  useEffect(() => {
    if (hasRegistered.current || !('serviceWorker' in navigator)) return;
    hasRegistered.current = true;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registered:', registration.scope);
        
        // Subscribe to push when SW is ready, user has granted permission, and VAPID key exists
        if (Notification.permission === 'granted' && VAPID_PUBLIC_KEY) {
          subscribe();
        }
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[App] Message from SW:', event.data);
      
      if (event.data.type === 'NOTIFICATION_CLICK') {
        console.log('[App] Notification click data:', event.data.data);
      }
    });
  }, []); // Empty deps - only run once on mount

  return <>{children}</>;
}