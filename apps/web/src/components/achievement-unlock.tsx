'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementUnlockProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
  } | null;
  show: boolean;
  onClose: () => void;
}

export function AchievementUnlock({ achievement, show, onClose }: AchievementUnlockProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Trophy icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="text-8xl mb-4 relative z-10"
            >
              {achievement.icon}
            </motion.div>

            {/* Achievement title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-amber-800 mb-2"
            >
              ¡Logro Desbloqueado!
            </motion.h2>

            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-gray-800 mb-2"
            >
              {achievement.title}
            </motion.h3>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
            >
              {achievement.description}
            </motion.p>

            {/* XP Reward */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="flex items-center justify-center gap-2 bg-amber-200 rounded-full px-6 py-3 mb-6"
            >
              <Star className="w-5 h-5 text-amber-700" />
              <span className="text-lg font-bold text-amber-800">+{achievement.xpReward} XP</span>
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold"
              >
                ¡Genial!
              </Button>
            </motion.div>

            {/* Confetti burst */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0,
                    y: 0,
                    scale: 0,
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.02 }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'][i % 4],
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage achievement unlocks
export function useAchievementUnlock() {
  const [currentAchievement, setCurrentAchievement] = useState<{
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
  } | null>(null);
  const [show, setShow] = useState(false);

  const unlockAchievement = (achievement: typeof currentAchievement) => {
    setCurrentAchievement(achievement);
    setShow(true);
  };

  const close = () => {
    setShow(false);
    setTimeout(() => setCurrentAchievement(null), 300);
  };

  return { currentAchievement, show, unlockAchievement, close };
}