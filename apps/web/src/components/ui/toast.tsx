'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Zap, Star, Mail } from 'lucide-react';

type ToastType = 'success' | 'error' | 'achievement' | 'xp' | 'levelup' | 'email';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast icon mapping
const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  achievement: Trophy,
  xp: Star,
  levelup: Zap,
  email: Mail,
};

// Toast colors
const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  achievement: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  xp: 'bg-purple-50 border-purple-200 text-purple-800',
  levelup: 'bg-blue-50 border-blue-200 text-blue-800',
  email: 'bg-cyan-50 border-cyan-200 text-cyan-800',
};

const toastIconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  achievement: 'text-yellow-500',
  xp: 'text-purple-500',
  levelup: 'text-blue-500',
  email: 'text-cyan-500',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = toastIcons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        ${toastColors[toast.type]}
      `}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${toastIconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{toast.title}</p>
        <p className="text-sm opacity-80">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="opacity-50 hover:opacity-100 transition-opacity"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string = '') => {
    addToast({ type: 'success', title, message, duration: 4000 });
  }, [addToast]);

  const showError = useCallback((title: string, message: string = '') => {
    addToast({ type: 'error', title, message, duration: 4000 });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showSuccess, showError }}>
      {children}
      
      {/* Toast container - fixed position */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem 
                toast={toast} 
                onRemove={() => removeToast(toast.id)} 
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Hook for specific toast types
export function useLessonCompletion() {
  const { addToast } = useToast();

  return {
    showLessonComplete: (lessonTitle: string, xpEarned: number) => {
      addToast({
        type: 'success',
        title: '¡Lección completada! 🎉',
        message: `${lessonTitle} - +${xpEarned} XP`,
        duration: 4000,
      });
    },

    showCourseComplete: (courseTitle: string) => {
      addToast({
        type: 'achievement',
        title: '¡Curso completado! 🏆',
        message: `Has completado "${courseTitle}". ¡Felicidades!`,
        duration: 6000,
      });
    },

    showLevelUp: (newLevel: number) => {
      addToast({
        type: 'levelup',
        title: `¡LEVEL UP! ⬆️`,
        message: `Ahora eres nivel ${newLevel}. ¡Sigue así!`,
        duration: 5000,
      });
    },

    showAchievement: (achievementName: string, xpReward: number) => {
      addToast({
        type: 'achievement',
        title: '🏆 Nuevo Logro',
        message: `${achievementName} - +${xpReward} XP`,
        duration: 5000,
      });
    },

    showError: (message: string) => {
      addToast({
        type: 'error',
        title: 'Error',
        message,
        duration: 4000,
      });
    },

    showEmailSent: (email: string) => {
      addToast({
        type: 'email',
        title: '📧 Email enviado',
        message: `Resumen enviado a ${email}`,
        duration: 4000,
      });
    },
  };
}