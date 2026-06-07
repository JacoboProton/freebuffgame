'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Star } from 'lucide-react';

interface Spline3DTooltipProps {
  visible: boolean;
  userName?: string;
  level: number;
  xp: number;
  xpNeeded: number;
  xpProgress: number;
  streak: number;
  achievements: number;
}

export function Spline3DTooltip({
  visible,
  userName = 'Aprendiz',
  level,
  xp,
  xpNeeded,
  xpProgress,
  streak,
  achievements,
}: Spline3DTooltipProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, rotateX: -15, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative w-[320px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.5) inset,
                0 1px 0 rgba(255, 255, 255, 0.6) inset
              `,
            }}
          >
            {/* Gradient accent line */}
            <div className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-500" />

            {/* Content */}
            <div className="p-4">
              {/* User header */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md"
                >
                  {level}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{userName}</div>
                  <div className="text-xs text-gray-500">Nivel {level}</div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">Experiencia</span>
                  <span className="text-xs text-gray-400">{xp} / {xp + xpNeeded} XP</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center p-2 rounded-xl bg-orange-50/80"
                >
                  <Flame className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-sm font-bold text-orange-600">{streak}</span>
                  <span className="text-[10px] text-orange-400">racha</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center p-2 rounded-xl bg-amber-50/80"
                >
                  <Star className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-sm font-bold text-amber-600">{xp}</span>
                  <span className="text-[10px] text-amber-400">XP</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center p-2 rounded-xl bg-emerald-50/80"
                >
                  <Trophy className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-sm font-bold text-emerald-600">{achievements}</span>
                  <span className="text-[10px] text-emerald-400">logros</span>
                </motion.div>
              </div>
            </div>

            {/* Decorative corner glow */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
