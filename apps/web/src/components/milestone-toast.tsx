'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, Flame, Star, ChevronRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';

interface MilestoneToast {
  id: string;
  type: 'streak' | 'xp' | 'achievement' | 'level' | 'course_complete';
  title: string;
  message: string;
  icon?: string;
  xpGained?: number;
  duration?: number;
}

interface MilestoneToastContainerProps {
  toasts: MilestoneToast[];
  onDismiss: (id: string) => void;
}

// Milestone icons
const milestoneIcons: Record<string, string> = {
  streak: '🔥',
  xp: '⚡',
  achievement: '🏆',
  level: '⭐',
  course_complete: '🎓',
};

// Confetti triggers for different milestones
const confettiConfigs: Record<string, { spread: number; colors: string[]; particleCount: number }> = {
  achievement: { spread: 80, colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'], particleCount: 80 },
  level: { spread: 120, colors: ['#FFD700', '#FF69B4', '#00CED1', '#7FFF00'], particleCount: 100 },
  course_complete: { spread: 100, colors: ['#9370DB', '#4169E1', '#20B2AA', '#FFD700'], particleCount: 90 },
  streak: { spread: 60, colors: ['#FF4500', '#FF6347', '#FFD700'], particleCount: 50 },
  xp: { spread: 50, colors: ['#FFD700', '#FFA500'], particleCount: 40 },
};

function triggerConfetti(type: string) {
  // Dynamically import confetti to avoid SSR issues
  if (typeof window === 'undefined') return;
  
  import('canvas-confetti').then((confettiModule) => {
    const confetti = confettiModule.default || confettiModule;
    const config = confettiConfigs[type] || confettiConfigs.achievement;
  
  confetti({
    particleCount: config.particleCount,
    spread: config.spread,
    colors: config.colors,      origin: { y: 0.6 },
    });
  });
  }

function MilestoneToastItem({
  toast,
  onDismiss,
}: {
  toast: MilestoneToast;
  onDismiss: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    // Progress bar countdown
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    // Trigger confetti on mount
    triggerConfetti(toast.type);

    return () => clearInterval(interval);
  }, [toast.type, duration, onDismiss]);

  const IconComponent = {
    streak: Flame,
    xp: Zap,
    achievement: Trophy,
    level: Star,
    course_complete: Sparkles,
  }[toast.type] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
    >
      {/* Confetti-like border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
        <motion.div
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-primary to-yellow-400"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0"
          >
            {toast.icon || milestoneIcons[toast.type]}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IconComponent className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                {toast.type === 'course_complete' ? 'Curso Completado' : toast.type}
              </span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{toast.title}</h4>
            <p className="text-sm text-gray-500">{toast.message}</p>

            {toast.xpGained && (
              <div className="flex items-center gap-1 mt-2 text-sm font-semibold text-yellow-500">
                <Zap className="w-4 h-4" />
                <span>+{toast.xpGained} XP</span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Action button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-primary hover:text-primary/80 group"
          onClick={onDismiss}
        >
          Continuar
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}

export function MilestoneToastContainer({ toasts, onDismiss }: MilestoneToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <MilestoneToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to manage milestone toasts
export function useMilestoneToasts() {
  const [toasts, setToasts] = useState<MilestoneToast[]>([]);

  const addToast = (toast: Omit<MilestoneToast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper methods for specific milestones
  const celebrateStreak = (streak: number) => {
    addToast({
      type: 'streak',
      title: `¡${streak} días de racha!`,
      message: streak >= 7 ? '¡Estás en racha caliente! 🔥' : '¡Sigue así!',
      xpGained: streak * 10,
    });
  };

  const celebrateXp = (amount: number, reason: string) => {
    addToast({
      type: 'xp',
      title: `+${amount} XP`,
      message: reason,
      xpGained: amount,
    });
  };

  const celebrateAchievement = (title: string, description: string, xpReward: number) => {
    addToast({
      type: 'achievement',
      title: '¡Nuevo Logro!',
      message: `${title} - ${description}`,
      icon: '🏆',
      xpGained: xpReward,
    });
  };

  const celebrateLevelUp = (level: number) => {
    addToast({
      type: 'level',
      title: `¡Nivel ${level}!`,
      message: 'Has subido de nivel. ¡Sigue así!',
      icon: '⭐',
      xpGained: 50,
    });
  };

  const celebrateCourseComplete = (courseName: string) => {
    addToast({
      type: 'course_complete',
      title: '¡Curso Completado!',
      message: `Has completado "${courseName}"`,
      icon: '🎓',
      xpGained: 200,
    });
  };

  return {
    toasts,
    addToast,
    dismissToast,
    celebrateStreak,
    celebrateXp,
    celebrateAchievement,
    celebrateLevelUp,
    celebrateCourseComplete,
  };
}