'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  Cpu,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number | null;
  fps: number;
  memoryUsage: number | null;
  renderCount: number;
  errorCount: number;
  isLoaded: boolean;
  lastRenderTime: number | null;
  averageFps: number;
}

interface SplinePerformanceMonitorProps {
  metrics: PerformanceMetrics;
  sceneId?: string;
  compact?: boolean;
}

function getFpsColor(fps: number): string {
  if (fps >= 55) return 'text-emerald-500';
  if (fps >= 30) return 'text-amber-500';
  return 'text-rose-500';
}

function getLoadTimeColor(ms: number | null): string {
  if (ms === null) return 'text-gray-400';
  if (ms < 1000) return 'text-emerald-500';
  if (ms < 3000) return 'text-amber-500';
  return 'text-rose-500';
}

function getMemoryColor(mb: number | null): string {
  if (mb === null) return 'text-gray-400';
  if (mb < 100) return 'text-emerald-500';
  if (mb < 300) return 'text-amber-500';
  return 'text-rose-500';
}

export function SplinePerformanceMonitor({
  metrics,
  sceneId = 'scene',
  compact = false,
}: SplinePerformanceMonitorProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-mono"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Activity className={`w-3 h-3 ${getFpsColor(metrics.fps)}`} />
        <span className={getFpsColor(metrics.fps)}>{metrics.fps} FPS</span>
        {metrics.loadTime !== null && (
          <>
            <span className="text-gray-500">|</span>
            <Clock className={`w-3 h-3 ${getLoadTimeColor(metrics.loadTime)}`} />
            <span className={getLoadTimeColor(metrics.loadTime)}>
              {Math.round(metrics.loadTime)}ms
            </span>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-2 right-2 z-40 min-w-[200px]"
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-t-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-white/90">{sceneId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className={`w-3 h-3 ${getFpsColor(metrics.fps)}`} />
          <span className={`text-[10px] font-mono ${getFpsColor(metrics.fps)}`}>
            {metrics.fps}fps
          </span>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded metrics */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5">
              {/* Divider */}
              <div className="h-px bg-white/10" />

              {/* Load Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3 h-3 ${getLoadTimeColor(metrics.loadTime)}`} />
                  <span className="text-[10px] text-gray-400">Load Time</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold ${getLoadTimeColor(
                    metrics.loadTime
                  )}`}
                >
                  {metrics.loadTime !== null ? `${Math.round(metrics.loadTime)}ms` : '—'}
                </span>
              </div>

              {/* FPS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className={`w-3 h-3 ${getFpsColor(metrics.fps)}`} />
                  <span className="text-[10px] text-gray-400">FPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-semibold ${getFpsColor(
                      metrics.fps
                    )}`}
                  >
                    {metrics.fps}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    avg {metrics.averageFps}
                  </span>
                </div>
              </div>

              {/* FPS Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    metrics.fps >= 55
                      ? 'bg-emerald-500'
                      : metrics.fps >= 30
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  animate={{ width: `${Math.min((metrics.fps / 60) * 100, 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Memory */}
              {metrics.memoryUsage !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu className={`w-3 h-3 ${getMemoryColor(metrics.memoryUsage)}`} />
                    <span className="text-[10px] text-gray-400">Memory</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold ${getMemoryColor(
                      metrics.memoryUsage
                    )}`}
                  >
                    {metrics.memoryUsage}MB
                  </span>
                </div>
              )}

              {/* Renders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-400">Renders</span>
                </div>
                <span className="text-[10px] font-mono text-gray-300">
                  {metrics.renderCount}
                </span>
              </div>

              {/* Errors */}
              {metrics.errorCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] text-gray-400">Errors</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 font-semibold">
                    {metrics.errorCount}
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Status</span>
                <span
                  className={`text-[10px] font-semibold ${
                    metrics.isLoaded ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {metrics.isLoaded ? '✓ Loaded' : '⏳ Loading...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
