'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface SplineSkeletonProps {
  variant?: 'default' | 'compact' | 'hero';
}

export function SplineSkeleton({ variant = 'default' }: SplineSkeletonProps) {
  const shapes = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        width: 20 + ((i * 13 + 7) % 60),
        height: 20 + ((i * 17 + 11) % 60),
        top: 10 + ((i * 23 + 5) % 80),
        left: 10 + ((i * 19 + 3) % 80),
        rotate: (i * 45) % 360,
        duration: 4 + (i % 3),
        delay: (i * 0.3) % 1.5,
      })),
    []
  );

  const shimmerLines = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        width: 40 + ((i * 17) % 40),
        top: 20 + (i * 20),
        left: 20 + ((i * 13) % 30),
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Shimmer wave overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
        }}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        }}
      />

      {/* Floating geometric shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-400/8 to-secondary/10"
          style={{
            width: `${shape.width}px`,
            height: `${shape.height}px`,
            top: `${shape.top}%`,
            left: `${shape.left}%`,
          }}
          animate={{
            y: [-8, 8, -8],
            rotate: [shape.rotate, shape.rotate + 15, shape.rotate],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Shimmer lines (content placeholders) */}
      {shimmerLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute h-2 rounded-full bg-gray-200/60"
          style={{
            width: `${line.width}%`,
            top: `${line.top}%`,
            left: `${line.left}%`,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: line.id * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Center loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* 3D cube spinner */}
          <div className="relative w-16 h-16" style={{ perspective: '200px' }}>
            <motion.div
              className="absolute inset-0 border-2 border-primary/30 rounded-xl"
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 180],
              }}
              transition={{
                rotateX: { duration: 3, repeat: Infinity, ease: 'linear' },
                rotateY: { duration: 1.5, repeat: Infinity, ease: 'linear' },
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front face */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-400/20 rounded-xl border border-primary/20" />
              {/* Back face */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-primary/20 rounded-xl border border-emerald-400/20"
                style={{ transform: 'translateZ(16px)' }}
              />
            </motion.div>
          </div>

          {/* Loading text with dots */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Cargando escena 3D</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="text-xs text-gray-400"
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="text-xs text-gray-400"
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="text-xs text-gray-400"
            >
              .
            </motion.span>
          </div>

          {/* Progress bar */}
          {variant === 'hero' && (
            <motion.div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative corner gradients */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-emerald-400/5 to-transparent rounded-full blur-2xl" />
    </div>
  );
}
