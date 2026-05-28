"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, BookOpen, AlertCircle, Info } from 'lucide-react';
import type { Notification } from '@/lib/use-notifications';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
  duration?: number;
}

const iconMap: Record<string, typeof Trophy> = {
  achievement: Trophy,
  level_up: TrendingUp,
  course: BookOpen,
  system: AlertCircle,
  error: AlertCircle,
  default: Info,
};

export function NotificationToast({ notification, onDismiss, duration = 5000 }: NotificationToastProps) {
  const Icon = iconMap[notification.type] || iconMap.default;
  
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className=\"bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl max-w-sm w-full pointer-events-auto\"
    >
      <div className=\"flex items-start gap-3\">
        <div className=\"flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center\">
          <Icon className=\"w-5 h-5 text-amber-400\" />
        </div>
        
        <div className=\"flex-1 min-w-0\">
          <p className=\"text-sm font-semibold text-white\">{notification.title}</p>
          <p className=\"text-xs text-gray-400 mt-1 line-clamp-2\">{notification.message}</p>
        </div>
        
        <button
          onClick={onDismiss}
          className=\"flex-shrink-0 p-1 rounded-lg hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-300\"
        >
          <X className=\"w-4 h-4\" />
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      <div className=\"mt-3 h-1 bg-gray-800 rounded-full overflow-hidden\">
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className=\"h-full bg-gradient-to-r from-amber-500 to-orange-500 origin-left\"
        />
      </div>
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className=\"fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none\">
      <AnimatePresence mode=\"popLayout\">
        {notifications.slice(0, 3).map((notification) => (
          <div key={notification.id} className=\"pointer-events-auto\">
            <NotificationToast
              notification={notification}
              onDismiss={() => onDismiss(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}