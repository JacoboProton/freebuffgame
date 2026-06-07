'use client';

import { useState, useEffect, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  Cpu,
  Layers,
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { useSplinePerformanceStore } from './useSplinePerformanceStore';

function getFpsColor(fps: number): string {
  if (fps >= 55) return 'text-emerald-500';
  if (fps >= 30) return 'text-amber-500';
  return 'text-rose-500';
}

function getFpsBg(fps: number): string {
  if (fps >= 55) return 'bg-emerald-500';
  if (fps >= 30) return 'bg-amber-500';
  return 'bg-rose-500';
}

function getLoadTimeColor(ms: number | null): string {
  if (ms === null) return 'text-gray-400';
  if (ms < 1000) return 'text-emerald-500';
  if (ms < 3000) return 'text-amber-500';
  return 'text-rose-500';
}

function MiniFpsChart({ data, height = 40 }: { data: number[]; height?: number }) {
  const gradId = useId();
  if (data.length === 0) return null;
  const max = Math.max(...data, 60);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points.join(' ')} 100,${height}`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#22c55e"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* 30fps threshold line */}
      <line
        x1="0"
        y1={height - (30 / max) * height}
        x2="100"
        y2={height - (30 / max) * height}
        stroke="#f59e0b"
        strokeWidth="0.5"
        strokeDasharray="3,3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export function SplinePerformanceDashboard() {
  const { snapshots, getSummaries, clearHistory, exportData } = useSplinePerformanceStore();
  const [tick, setTick] = useState(0);
  const summaries = useMemo(() => getSummaries(), [snapshots, tick]);

  // Refresh every 2s to show live data
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const totalSnapshots = snapshots.length;
  const allLoadTimes = snapshots.filter((s) => s.loadTime !== null).map((s) => s.loadTime as number);
  const avgLoadTime = allLoadTimes.length > 0 ? Math.round(allLoadTimes.reduce((a, b) => a + b, 0) / allLoadTimes.length) : null;
  const totalErrors = snapshots.reduce((sum, s) => sum + s.errorCount, 0);
  const latestMemory = [...snapshots].reverse().find((s) => s.memoryUsage !== null)?.memoryUsage ?? null;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spline-perf-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Performance Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoreo de rendimiento de escenas 3D Spline en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar JSON
          </button>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-400 bg-rose-950 hover:bg-rose-900 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-4 h-4 text-emerald-600" />}
          label="Escenas"
          value={summaries.length}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<Layers className="w-4 h-4 text-blue-600" />}
          label="Muestras"
          value={totalSnapshots}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          label="Carga Promedio"
          value={avgLoadTime !== null ? `${avgLoadTime}ms` : '—'}
          color="bg-amber-50"
        />
        <StatCard
          icon={<Cpu className="w-4 h-4 text-purple-600" />}
          label="Memoria"
          value={latestMemory !== null ? `${latestMemory}MB` : '—'}
          color="bg-purple-50"
        />
      </div>

      {/* Errors banner */}
      {totalErrors > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200"
        >              <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span className="text-sm font-medium text-rose-300">
            {totalErrors} error{totalErrors > 1 ? 'es' : ''} detectado{totalErrors > 1 ? 's' : ''} en las escenas 3D
          </span>
        </motion.div>
      )}

      {/* Scene cards */}
      {summaries.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Sin datos aún</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Navega a la página principal con <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-gray-300">?debug</code> en la URL para comenzar a recopilar métricas de rendimiento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {summaries.map((summary) => {
            const fpsData = summary.snapshots.slice(-30).map((s) => s.fps);
            const latest = summary.latest;

            return (
              <motion.div
                key={summary.sceneId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-800 bg-gray-900/60 shadow-sm overflow-hidden backdrop-blur-sm"
              >
                {/* Scene header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-bold text-white">{summary.sceneId}</h3>
                      <span className="text-xs text-gray-500">
                        {summary.snapshots.length} muestras · {summary.totalRenders} renders
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Live FPS */}
                    <div className="text-right">
                      <div className={`text-2xl font-bold font-mono ${getFpsColor(latest?.fps ?? 0)}`}>
                        {latest?.fps ?? 0}
                      </div>
                      <div className="text-[10px] text-gray-500">FPS actual</div>
                    </div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">FPS Promedio</div>
                    <div className={`text-lg font-bold font-mono ${getFpsColor(summary.avgFps)}`}>
                      {summary.avgFps}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Carga Promedio</div>
                    <div className={`text-lg font-bold font-mono ${getLoadTimeColor(summary.avgLoadTime)}`}>
                      {summary.avgLoadTime !== null ? `${summary.avgLoadTime}ms` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Pico Memoria</div>
                    <div className="text-lg font-bold font-mono text-purple-500">
                      {summary.peakMemory !== null ? `${summary.peakMemory}MB` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Errores</div>
                    <div className={`text-lg font-bold font-mono ${summary.totalErrors > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {summary.totalErrors}
                    </div>
                  </div>
                </div>

                {/* FPS chart */}
                <div className="px-5 pb-4">
                  <div className="text-xs text-gray-500 mb-2">FPS (últimas {fpsData.length} muestras)</div>
                  <div className="p-3 rounded-xl bg-gray-800/50">
                    <MiniFpsChart data={fpsData} height={50} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-600">-30s</span>
                      <span className="text-[9px] text-gray-600">ahora</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
