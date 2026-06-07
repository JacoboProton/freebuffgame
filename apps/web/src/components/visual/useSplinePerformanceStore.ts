'use client';

import { create } from 'zustand';

interface SceneSnapshot {
  sceneId: string;
  timestamp: number;
  loadTime: number | null;
  fps: number;
  memoryUsage: number | null;
  renderCount: number;
  errorCount: number;
  averageFps: number;
}

interface SceneSummary {
  sceneId: string;
  snapshots: SceneSnapshot[];
  latest: SceneSnapshot | null;
  avgLoadTime: number | null;
  avgFps: number;
  peakMemory: number | null;
  totalErrors: number;
  totalRenders: number;
}

interface SplinePerformanceState {
  snapshots: SceneSnapshot[];
  recordSnapshot: (snapshot: SceneSnapshot) => void;
  getSummaries: () => SceneSummary[];
  clearHistory: () => void;
  exportData: () => string;
}

const MAX_SNAPSHOTS = 500;

export const useSplinePerformanceStore = create<SplinePerformanceState>((set, get) => ({
  snapshots: [],

  recordSnapshot: (snapshot) => {
    set((state) => {
      const snapshots = [...state.snapshots, snapshot];
      if (snapshots.length > MAX_SNAPSHOTS) {
        snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);
      }
      return { snapshots };
    });
  },

  getSummaries: () => {
    const { snapshots } = get();
    const grouped = new Map<string, SceneSnapshot[]>();

    for (const snap of snapshots) {
      const arr = grouped.get(snap.sceneId) || [];
      arr.push(snap);
      grouped.set(snap.sceneId, arr);
    }

    const summaries: SceneSummary[] = [];

    for (const [sceneId, snaps] of grouped) {
      const loadTimes = snaps.filter((s) => s.loadTime !== null).map((s) => s.loadTime as number);
      const fpsValues = snaps.map((s) => s.fps);
      const memories = snaps.filter((s) => s.memoryUsage !== null).map((s) => s.memoryUsage as number);
      const lastSnap = snaps[snaps.length - 1];

      summaries.push({
        sceneId,
        snapshots: snaps,
        latest: lastSnap,
        avgLoadTime: loadTimes.length > 0 ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : null,
        avgFps: fpsValues.length > 0 ? Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length) : 0,
        peakMemory: memories.length > 0 ? Math.max(...memories) : null,
        totalErrors: lastSnap.errorCount,
        totalRenders: lastSnap.renderCount,
      });
    }

    return summaries;
  },

  clearHistory: () => set({ snapshots: [] }),

  exportData: () => {
    const { snapshots } = get();
    return JSON.stringify(snapshots, null, 2);
  },
}));
