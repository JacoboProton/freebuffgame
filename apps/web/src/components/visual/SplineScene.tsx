'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
});

interface SplineSceneProps {
  scene?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

function SplineLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="text-xs text-gray-400 font-medium">Cargando escena 3D...</span>
      </div>
    </div>
  );
}

function AnimatedFallback() {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: 20 + (((i * 17 + 7) % 60)),
        left: 20 + (((i * 23 + 13) % 60)),
        duration: 3 + (i % 3),
        delay: (i * 0.5) % 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="relative w-full h-full">
        {/* Main rotating shape */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="w-32 h-32 bg-gradient-to-br from-primary/30 via-emerald-400/20 to-secondary/25 rounded-3xl blur-[1px]" />
        </motion.div>

        {/* Secondary orbiting shape */}
        <motion.div
          className="absolute top-1/2 left-1/2"
          animate={{
            rotate: [0, -360],
            x: [-60, 60, -60],
            y: [-30, 30, -30],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-16 h-16 bg-gradient-to-tl from-amber-400/25 to-primary/20 rounded-2xl -rotate-12" />
        </motion.div>

        {/* Small orbiting dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-4 h-4"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ transformOrigin: '80px 2px' }}
        >
          <div className="w-4 h-4 bg-primary/40 rounded-full blur-[1px]" style={{ transform: 'translateX(80px)' }} />
        </motion.div>

        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Center icon */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg border border-white/50">
            <svg
              className="w-10 h-10 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function SplineScene({
  scene,
  className = '',
  style,
  fallback,
}: SplineSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  // Don't render anything on server
  if (!mounted) {
    return null;
  }

  // No scene URL provided — show animated fallback
  if (!scene || !scene.includes('spline.design')) {
    return (
      <div className={`relative ${className}`} style={style}>
        {fallback || <AnimatedFallback />}
      </div>
    );
  }

  // Error state — show fallback
  if (hasError) {
    return (
      <div className={`relative ${className}`} style={style}>
        {fallback || <AnimatedFallback />}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10"
          >
            <SplineLoader />
          </motion.div>
        )}
      </AnimatePresence>
      <Spline scene={scene} onLoad={handleLoad} onError={handleError} />
    </div>
  );
}
