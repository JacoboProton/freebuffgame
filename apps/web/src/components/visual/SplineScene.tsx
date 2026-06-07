'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSplinePerformance } from './useSplinePerformance';
import { SplinePerformanceMonitor } from './SplinePerformanceMonitor';
import { useSplinePerformanceStore } from './useSplinePerformanceStore';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
});

interface SplineSceneProps {
  scene?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  priority?: boolean;
  rootMargin?: string;
  showPerformance?: boolean;
  sceneId?: string;
}

import { SplineSkeleton } from './SplineSkeleton';

function SplineLoader() {
  return <SplineSkeleton />;
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
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  priority = false,
  rootMargin = '200px',
  showPerformance = false,
  sceneId = 'scene',
}: SplineSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDebug, setIsDebug] = useState(false);
  const { metrics, startLoad, endLoad, recordError, recordRender } = useSplinePerformance({ sceneId });
  const recordSnapshot = useSplinePerformanceStore((s) => s.recordSnapshot);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || priority) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, rootMargin]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
      setIsDebug(true);
    }
  }, []);

  // Start load timer when scene becomes visible
  useEffect(() => {
    if (isVisible && !hasError) {
      startLoad();
    }
  }, [isVisible, hasError, startLoad]);

  // Periodic snapshot recording for dashboard
  useEffect(() => {
    if (!isVisible || isLoading) return;
    const interval = setInterval(() => {
      const m = useSplinePerformanceStore.getState();
      // Read fresh metrics from hook refs via the latest state
      recordSnapshot({
        sceneId,
        timestamp: Date.now(),
        loadTime: metrics.loadTime,
        fps: metrics.fps,
        memoryUsage: metrics.memoryUsage,
        renderCount: metrics.renderCount,
        errorCount: metrics.errorCount,
        averageFps: metrics.averageFps,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible, isLoading, recordSnapshot, sceneId]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    endLoad();
    recordRender();
    recordSnapshot({
      sceneId,
      timestamp: Date.now(),
      loadTime: metrics.loadTime,
      fps: metrics.fps || 0,
      memoryUsage: metrics.memoryUsage,
      renderCount: metrics.renderCount + 1,
      errorCount: metrics.errorCount,
      averageFps: metrics.averageFps,
    });
  }, [endLoad, recordRender, recordSnapshot, sceneId, metrics]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    recordError();
    recordSnapshot({
      sceneId,
      timestamp: Date.now(),
      loadTime: null,
      fps: 0,
      memoryUsage: null,
      renderCount: 0,
      errorCount: metrics.errorCount + 1,
      averageFps: 0,
    });
  }, [recordError, recordSnapshot, sceneId, metrics]);

  // Don't render anything on server
  if (!mounted) {
    return null;
  }

  // No scene URL provided — show animated fallback
  if (!scene || !scene.includes('spline.design')) {
    return (
      <div
        className={`relative ${className}`}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        {fallback || <AnimatedFallback />}
      </div>
    );
  }

  // Error state — show fallback
  if (hasError) {
    return (
      <div
        className={`relative ${className}`}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        {fallback || <AnimatedFallback />}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <AnimatePresence>
        {isLoading && isVisible && (
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
      {isVisible && <Spline scene={scene} onLoad={handleLoad} onError={handleError} />}
      {showPerformance && (process.env.NODE_ENV === 'development' || isDebug) && <SplinePerformanceMonitor metrics={metrics} sceneId={sceneId} />}
    </div>
  );
}
