'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedStreakProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
  showDetails?: boolean;
}

export function EnhancedStreak({
  currentStreak,
  longestStreak,
  className,
  showDetails = false,
}: EnhancedStreakProps) {
  const [isHotStreak, setIsHotStreak] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    setIsHotStreak(currentStreak >= 7);
  }, [currentStreak]);

  // Generate fire particles for hot streaks
  useEffect(() => {
    if (isHotStreak && currentStreak > 0) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() * 40 - 20,
          y: -20 - Math.random() * 10,
        };
        setParticles((prev) => [...prev.slice(-5), newParticle]);
        
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 1000);
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isHotStreak, currentStreak]);

  const getStreakEmoji = () => {
    if (currentStreak >= 30) return '🔥🔥🔥';
    if (currentStreak >= 14) return '🔥🔥';
    if (currentStreak >= 7) return '🔥';
    return '✨';
  };

  const getStreakTitle = () => {
    if (currentStreak >= 30) return '¡Racha Legendaria!';
    if (currentStreak >= 14) return '¡Racha Impresionante!';
    if (currentStreak >= 7) return '¡Racha Caliente!';
    if (currentStreak >= 3) return '¡Buena Racha!';
    return 'Continúa Así';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6',
        className
      )}
    >
      {/* Glow effect for hot streaks */}
      {isHotStreak && currentStreak > 0 && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 rounded-2xl blur-lg -z-10"
        />
      )}

      <div className="relative">
        {/* Fire particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{
              opacity: 0,
              y: -60,
              x: particle.x,
              scale: [1, 0.5, 0],
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute left-1/2 top-0 w-2 h-2 bg-orange-400 rounded-full"
            style={{ transform: `translate(${particle.x}px, 0px)` }}
          />
        ))}

        {/* Main streak display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <motion.div
              animate={currentStreak > 0 && isHotStreak ? {
                scale: [1, 1.1, 1],
                filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
              } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative"
            >
              <Flame
                className={cn(
                  'w-16 h-16',
                  currentStreak === 0
                    ? 'text-gray-300'
                    : currentStreak >= 7
                    ? 'text-orange-500 fill-orange-400'
                    : 'text-orange-400 fill-orange-300'
                )}
              />
              
              {/* Inner glow for active streaks */}
              {currentStreak > 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-orange-400 to-transparent opacity-50 rounded-full blur-md" />
              )}
            </motion.div>

            {/* Sparkle overlay */}
            {currentStreak >= 14 && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                  className="absolute -top-1 -right-1 text-yellow-400"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  className="absolute -bottom-1 -left-1 text-yellow-400"
                >
                  ✨
                </motion.div>
              </>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-5xl font-bold',
                  currentStreak === 0
                    ? 'text-gray-400'
                    : currentStreak >= 7
                    ? 'text-orange-500'
                    : 'text-orange-400'
                )}
              >
                {currentStreak}
              </span>
              <span className="text-xl text-gray-500">días</span>
            </div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {getStreakTitle()}
            </p>
          </div>
        </div>

        {/* Emoji badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 text-2xl"
        >
          {getStreakEmoji()}
        </motion.div>

        {/* Stats */}
        {showDetails && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-orange-100 dark:border-orange-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {longestStreak}
              </p>
              <p className="text-xs text-gray-500">Récord</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                +{currentStreak * 10}
              </p>
              <p className="text-xs text-gray-500">XP Bonus</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentStreak >= longestStreak ? '🏆' : `${longestStreak - currentStreak}`}
              </p>
              <p className="text-xs text-gray-500">Para récord</p>
            </div>
          </div>
        )}

        {/* Progress to next milestone */}
        {currentStreak > 0 && currentStreak < 30 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Siguiente: {Math.min(currentStreak + 1, 7)} días</span>
              <span>{currentStreak >= 7 ? '✅' : `${currentStreak}/7`}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Compact streak badge for cards
export function StreakBadge({ streak }: { streak: number }) {
  const isHot = streak >= 7;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
        isHot
          ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      )}
    >
      <Flame className={cn('w-4 h-4', isHot ? 'animate-pulse' : '')} />
      <span>{streak}</span>
    </motion.div>
  );
}