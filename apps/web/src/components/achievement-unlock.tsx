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

// Share to social media function
function shareAchievement(title: string, icon: string) {
  const text = `¡Desbloqueé el logro "${title}" ${icon} en Duobi-Jac! 🐐 #DuobiJac #AprendeJugando`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
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
              className="flex items-center justify-center gap-2 bg-amber-200 rounded-full px-6 py-3 mb-4"
            >
              <Star className="w-5 h-5 text-amber-700" />
              <span className="text-lg font-bold text-amber-800">+{achievement.xpReward} XP</span>
            </motion.div>

            {/* Share buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <button
                onClick={() => shareAchievement(achievement.title, achievement.icon)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Compartir
              </button>
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