'use client';

import { useEffect, useRef } from 'react';

interface PushProviderProps {
  children: React.ReactNode;
}

export function PushProvider({ children }: PushProviderProps) {
  const serviceWorkerRegistration = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
          serviceWorkerRegistration.current = registration;
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return <>{children}</>;
}