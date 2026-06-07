'use client';

import { create } from 'zustand';

interface SplinePreferencesData {
  tiltEnabled: boolean;
  tiltAmount: number;
  glareEnabled: boolean;
  glareColor: string;
  hoverScale: number;
  soundEnabled: boolean;
  soundVolume: number;
  showOnboarding: boolean;
  showPerformance: boolean;
  reducedMotion: boolean;
}

interface SplinePreferences extends SplinePreferencesData {
  setTiltEnabled: (enabled: boolean) => void;
  setTiltAmount: (amount: number) => void;
  setGlareEnabled: (enabled: boolean) => void;
  setGlareColor: (color: string) => void;
  setHoverScale: (scale: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowPerformance: (show: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'spline-3d-preferences';

const defaultPreferences: SplinePreferencesData = {
  tiltEnabled: true,
  tiltAmount: 12,
  glareEnabled: true,
  glareColor: 'rgba(34, 197, 94, 0.3)',
  hoverScale: 1.03,
  soundEnabled: true,
  soundVolume: 0.15,
  showOnboarding: true,
  showPerformance: false,
  reducedMotion: false,
};

function loadFromStorage(): Partial<SplinePreferencesData> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveToStorage(data: SplinePreferencesData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export const useSplinePreferences = create<SplinePreferences>((set, get) => ({
  ...defaultPreferences,
  ...loadFromStorage(),

  setTiltEnabled: (tiltEnabled) => {
    set({ tiltEnabled });
    const { tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setTiltAmount: (tiltAmount) => {
    set({ tiltAmount });
    const { tiltEnabled, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setGlareEnabled: (glareEnabled) => {
    set({ glareEnabled });
    const { tiltEnabled, tiltAmount, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setGlareColor: (glareColor) => {
    set({ glareColor });
    const { tiltEnabled, tiltAmount, glareEnabled, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setHoverScale: (hoverScale) => {
    set({ hoverScale });
    const { tiltEnabled, tiltAmount, glareEnabled, glareColor, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    const { tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundVolume, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setSoundVolume: (soundVolume) => {
    set({ soundVolume });
    const { tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, showOnboarding, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setShowOnboarding: (showOnboarding) => {
    set({ showOnboarding });
    const { tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showPerformance, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setShowPerformance: (showPerformance) => {
    set({ showPerformance });
    const { tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, reducedMotion } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
    const { tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance } = get();
    saveToStorage({ tiltEnabled, tiltAmount, glareEnabled, glareColor, hoverScale, soundEnabled, soundVolume, showOnboarding, showPerformance, reducedMotion });
  },
  resetToDefaults: () => {
    set(defaultPreferences);
    saveToStorage(defaultPreferences);
  },
}));
