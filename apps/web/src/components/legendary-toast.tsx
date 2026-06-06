'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, type Notification } from '@/lib/use-notifications';

interface LegendaryToast {
  id: string;
  icon: string;
  title: string;
  message: string;
  userName?: string;
}

export function LegendaryToastListener() {
  const [toast, setToast] = useState<LegendaryToast | null>(null);

  const onBroadcast = useCallback((notification: Notification) => {
    if (notification.type === 'legendary_achievement') {
      const newToast: LegendaryToast = {
        id: notification.id || `toast-${Date.now()}`,
        icon: (notification.data?.icon as string) || '🏆',
        title: notification.title,
        message: notification.message,
        userName: notification.data?.userName as string,
      };
      setToast(newToast);
      // Auto-dismiss after 8 seconds
      setTimeout(() => setToast(null), 8000);
    }
  }, []);

  useNotifications({ onBroadcast });

  return (
    <div className="fixed top-20 right-4 z-[100] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="pointer-events-auto"
          >
            <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-4 shadow-2xl max-w-sm overflow-hidden">
              {/* Animated sparkles background */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -15],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                  className="absolute text-yellow-400/40"
                  style={{ left: `${20 + i * 15}%`, top: '50%' }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
              ))}

              {/* Close button */}
              <button
                onClick={() => setToast(null)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>

              <div className="flex items-start gap-3 relative z-10">
                {/* Icon */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl flex-shrink-0"
                >
                  {toast.icon}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Logro Legendario
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2">
                    {toast.message}
                  </p>
                  <Link
                    href="/dashboard/masters"
                    className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium mt-2 hover:text-amber-800 transition-colors"
                    onClick={() => setToast(null)}
                  >
                    Ver leaderboard de Maestros →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
