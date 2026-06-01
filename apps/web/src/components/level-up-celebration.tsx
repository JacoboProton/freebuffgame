'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, Star, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  currentXP: number;
  nextLevelXP: number;
}

export function LevelUpCelebration({
  isOpen,
  onClose,
  newLevel,
  currentXP,
  nextLevelXP,
}: LevelUpCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setShowConfetti(true);
      
      // Dynamically import confetti to avoid SSR issues
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default || confettiModule;
        
        // Fire multiple confetti bursts
        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'];

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };

        // Small delay before starting confetti
        setTimeout(() => {
          frame();
        }, 300);

        // Cleanup confetti
        const cleanupTimeout = setTimeout(() => {
          setShowConfetti(false);
        }, duration);

        return () => {
          clearTimeout(cleanupTimeout);
          confetti.reset();
        };
      });
    }
  }, [isOpen]);

  const levelTitles: Record<number, string> = {
    2: 'Aprendiz Dedicado',
    3: 'Explorador del Conocimiento',
    4: 'Estudiante Entusiasta',
    5: 'Aprendiz Avanzado',
    6: 'Experto en Desarrollo',
    7: 'Maestro del Código',
    8: 'Guardián de la Sabiduría',
    9: 'Sabio Digital',
    10: 'Campeón del Aprendizaje',
    11: 'Leyenda del Código',
    12: 'Maestro Supremo',
    13: 'Gran Maestro',
    14: 'Élite del Conocimiento',
    15: 'Oráculo de la Programación',
  };

  const title = levelTitles[newLevel] || 'Nivel Alcanzado';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse" />
              
              {/* Main content */}
              <div className="relative">
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="mb-4"
                >
                  <Sparkles className="w-16 h-16 mx-auto text-yellow-500 animate-pulse" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full">
                    <Trophy className="w-6 h-6" />
                    <span className="text-3xl font-bold">¡NIVEL {newLevel}!</span>
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Has alcanzado un nuevo nivel en tu viaje de aprendizaje
                </p>

                {/* XP Progress */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{currentXP} XP</span>
                    </div>
                    <span className="text-gray-500 text-sm">{nextLevelXP} para siguiente nivel</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentXP / 500) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Rewards preview */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                    <Star className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                    <p className="text-xs text-purple-600 dark:text-purple-400">Nuevo Badge</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
                    <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">+50 XP Bonus</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                    <Trophy className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <p className="text-xs text-green-600 dark:text-green-400">Rango Especial</p>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white group"
                >
                  Continuar Aprendiendo
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger level-up celebration
export function useLevelUpCelebration() {
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    newLevel: number;
    currentXP: number;
  } | null>(null);

  const triggerCelebration = (newLevel: number, currentXP: number) => {
    setCelebration({
      isOpen: true,
      newLevel,
      currentXP,
    });
  };

  const closeCelebration = () => {
    setCelebration((prev) => prev ? { ...prev, isOpen: false } : null);
  };

  return {
    celebration,
    triggerCelebration,
    closeCelebration,
  };
}