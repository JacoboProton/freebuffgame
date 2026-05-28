'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        setLoading(false);
        return;
      }

      // Check notification permission
      setPermission(Notification.permission);

      // Check if already subscribed
      const registration = await navigator.serviceWorker?.ready;
      if (!registration) {
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    setSubscribing(true);
    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        alert('Necesitas permitir notificaciones para recibir alertas');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker?.ready;
      if (!registration) {
        alert('No se pudo acceder al service worker');
        return;
      }

      // Check if service worker exists, if not register one
      let swRegistration = registration;

      // VAPID public key - in production, this should be from environment variable
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYB5X684Tmk=';

      // Subscribe to push
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        alert('Error al suscribirse a notificaciones');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      alert('Error al activar notificaciones');
    } finally {
      setSubscribing(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setSubscribing(true);
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/3 mt-1"></div>
          </div>
        </div>
      </div>
    );
  }

  // Browser doesn't support notifications
  if (!('Notification' in window)) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              Notificaciones push
            </div>
            <div className="text-sm text-gray-500">
              {permission === 'denied'
                ? 'Bloqueadas por el navegador'
                : isSubscribed
                ? 'Activas'
                : 'Inactivas'}
            </div>
          </div>
        </div>

        <button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          disabled={subscribing || permission === 'denied'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSubscribed
              ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {subscribing ? (
            'Procesando...'
          ) : isSubscribed ? (
            <span className="flex items-center gap-1">
              <BellOff className="w-4 h-4" />
              Desactivar
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Bell className="w-4 h-4" />
              Activar
            </span>
          )}
        </button>
      </div>

      {isSubscribed && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500">
            Recibirás alertas sobre:
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Check className="w-4 h-4 text-green-500" />
              Recordatorios de racha diaria
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Check className="w-4 h-4 text-green-500" />
              Nuevos badges desbloqueados
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Check className="w-4 h-4 text-green-500" />
              Cuando te superan en el ranking
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const uint8Array = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    uint8Array[i] = rawData.charCodeAt(i);
  }
  return buffer;
}