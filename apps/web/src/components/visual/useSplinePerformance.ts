'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SplinePerformanceMetrics {
  loadTime: number | null;
  fps: number;
  memoryUsage: number | null;
  renderCount: number;
  errorCount: number;
  isLoaded: boolean;
  lastRenderTime: number | null;
  averageFps: number;
}

interface UseSplinePerformanceOptions {
  sceneId?: string;
  trackFps?: boolean;
  trackMemory?: boolean;
  fpsSampleInterval?: number;
}

const fpsHistory = new Map<string, number[]>();

export function useSplinePerformance(
  options: UseSplinePerformanceOptions = {}
): {
  metrics: SplinePerformanceMetrics;
  startLoad: () => void;
  endLoad: () => void;
  recordError: () => void;
  recordRender: () => void;
} {
  const {
    sceneId = 'default',
    trackFps = true,
    trackMemory = true,
    fpsSampleInterval = 1000,
  } = options;

  const [metrics, setMetrics] = useState<SplinePerformanceMetrics>({
    loadTime: null,
    fps: 0,
    memoryUsage: null,
    renderCount: 0,
    errorCount: 0,
    isLoaded: false,
    lastRenderTime: null,
    averageFps: 0,
  });

  const loadStartTime = useRef<number | null>(null);
  const renderCountRef = useRef(0);
  const errorCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoad = useCallback(() => {
    loadStartTime.current = performance.now();
  }, []);

  const endLoad = useCallback(() => {
    if (loadStartTime.current !== null) {
      const loadTime = performance.now() - loadStartTime.current;
      loadStartTime.current = null;
      setMetrics((prev) => ({
        ...prev,
        loadTime: Math.round(loadTime * 100) / 100,
        isLoaded: true,
      }));

      // Log performance to console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SplinePerf] Scene "${sceneId}" loaded in ${Math.round(loadTime)}ms`);
      }
    }
  }, [sceneId]);

  const recordError = useCallback(() => {
    errorCountRef.current += 1;
    setMetrics((prev) => ({
      ...prev,
      errorCount: errorCountRef.current,
    }));
  }, []);

  const recordRender = useCallback(() => {
    renderCountRef.current += 1;
    setMetrics((prev) => ({
      ...prev,
      renderCount: renderCountRef.current,
      lastRenderTime: performance.now(),
    }));
  }, []);

  // FPS tracking
  useEffect(() => {
    if (!trackFps) return;

    const tick = () => {
      frameCountRef.current++;
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);

    fpsIntervalRef.current = setInterval(() => {
      const currentFps = frameCountRef.current;
      frameCountRef.current = 0;

      // Track history for average
      const history = fpsHistory.get(sceneId) || [];
      history.push(currentFps);
      if (history.length > 30) history.shift();
      fpsHistory.set(sceneId, history);

      const avg = history.reduce((a, b) => a + b, 0) / history.length;

      setMetrics((prev) => ({
        ...prev,
        fps: currentFps,
        averageFps: Math.round(avg),
      }));
    }, fpsSampleInterval);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (fpsIntervalRef.current !== null) clearInterval(fpsIntervalRef.current);
    };
  }, [trackFps, fpsSampleInterval, sceneId]);

  // Memory tracking (Chrome only)
  useEffect(() => {
    if (!trackMemory) return;

    const checkMemory = () => {
      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number };
      };
      if (perf.memory) {
        const usedMB = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: usedMB,
        }));
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 3000);
    return () => clearInterval(interval);
  }, [trackMemory]);

  return { metrics, startLoad, endLoad, recordError, recordRender };
}
