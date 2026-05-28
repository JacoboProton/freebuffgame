"use client";

import { useEffect, useState, useCallback, useRef } from 'react';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

interface UseNotificationsOptions {
  onNotification?: (notification: Notification) => void;
  onBroadcast?: (notification: Notification) => void;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { onNotification, onBroadcast, enabled = true } = options;
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    onNotification?.(notification);
  }, [onNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Create SSE connection with absolute URL
    const eventSource = new EventSource(`${window.location.origin}/api/notifications/stream`);
    eventSourceRef.current = eventSource;

    // Handle connection
    eventSource.addEventListener('connected', () => {
      setConnected(true);
      console.log('Notification stream connected');
    });

    // Handle notifications
    eventSource.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        notification.createdAt = new Date(notification.createdAt);
        addNotification(notification);
      } catch (err) {
        console.error('Failed to parse notification:', err);
      }
    });

    // Handle broadcasts
    eventSource.addEventListener('broadcast', (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        notification.createdAt = new Date(notification.createdAt);
        onBroadcast?.(notification);
      } catch (err) {
        console.error('Failed to parse broadcast:', err);
      }
    });

    // Handle errors
    eventSource.onerror = () => {
      setConnected(false);
      console.error('Notification stream error, reconnecting...');
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [enabled, addNotification, onBroadcast]);

  return {
    connected,
    notifications,
    addNotification,
    clearNotifications,
    markAsRead: async (notificationId: string) => {
      try {
        await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
  };
}