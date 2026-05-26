import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// NOTE: User interface and XP utilities are defined locally to avoid
// @duobijac/shared workspace resolution issues. In production, configure
// workspace dependencies properly to import from the shared package.
const XP_PER_LEVEL = 500;
const calculateLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;
const xpToNextLevel = (xp: number): number => XP_PER_LEVEL - (xp % XP_PER_LEVEL);
const progressToNextLevel = (xp: number): number => (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

// User type (defined locally to avoid workspace resolution issues with @duobijac/shared)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'duobijac-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Re-export XP utilities for convenience
export { XP_PER_LEVEL, calculateLevel, xpToNextLevel, progressToNextLevel };