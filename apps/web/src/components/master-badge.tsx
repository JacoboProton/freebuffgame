'use client';

import { motion } from 'framer-motion';
import { Star, Sparkles, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MasterBadgeProps {
  unlocked: boolean;
  className?: string;
  onShare?: () => void;
}

export function MasterBadge({ unlocked, className, onShare }: MasterBadgeProps) {
  if (!unlocked) {
    return (
      <div className={cn(
        "relative rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center min-h-[220px] flex flex-col items-center justify-center",
        className
      )}>
        <div className="text-6xl mb-3 grayscale opacity-40">🎓</div>
        <h3 className="font-bold text-gray-400 text-lg mb-1">Maestro del Conocimiento</h3>
        <p className="text-sm text-gray-400">
          Aprueba todos los exámenes finales de los cursos para desbloquear este logro legendario
        </p>
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
          <Star className="w-3 h-3" />
          <span>500 XP</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 150 }}
      className={cn("relative", className)}
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 opacity-75 blur-sm animate-pulse" />

      {/* Main card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-400 p-6 text-center overflow-hidden">
        {/* Animated sparkle particles (pre-computed positions to avoid hydration mismatch) */}
        {[[-35, -45], [42, -38], [-28, -52], [50, -30], [-40, -35], [38, -48], [-22, -55], [45, -42]].map(([dx, dy], i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, dx],
              y: [0, dy],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute top-1/2 left-1/2"
          >
            <Sparkles className="w-3 h-3 text-yellow-500" />
          </motion.div>
        ))}

        {/* Rotating glow behind icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400/30 via-amber-500/20 to-orange-500/30 blur-xl"
        />

        {/* Icon with pulse */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -3, 3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-7xl mb-3 relative z-10"
        >
          🎓
        </motion.div>

        {/* Title with gradient text */}
        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-bold text-xl mb-1 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent relative z-10"
        >
          Maestro del Conocimiento
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-amber-700 mb-3 relative z-10"
        >
          Has aprobado TODOS los exámenes finales de los cursos
        </motion.p>

        {/* XP badge */}
        <motion.div
          initial={{ y: 10, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full px-4 py-1.5 text-sm font-bold shadow-lg relative z-10"
        >
          <Star className="w-4 h-4 fill-current" />
          +500 XP
        </motion.div>

        {/* "LEGENDARY" label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 relative z-10"
        >
          <span className="inline-flex items-center gap-1 text-xs font-bold tracking-widest text-amber-600 uppercase">
            <Sparkles className="w-3 h-3" />
            Legendario
            <Sparkles className="w-3 h-3" />
          </span>
        </motion.div>

        {/* Share button */}
        {onShare && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="mt-4 relative z-10 inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Compartir Logro
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
