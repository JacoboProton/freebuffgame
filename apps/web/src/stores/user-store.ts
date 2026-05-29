import { create } from 'zustand';
import { clerkFetchAPI } from '@/lib/clerk-api';
import { fetchAPI } from '@/lib/api-client';

// Store doesn't have access to Clerk's getToken directly, so we need to handle it differently
// We'll create a wrapper that can be called with getToken from a component

const XP_PER_LEVEL = 500;

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string;
  memberSince: string;
  lessonsCompleted: number;
  totalTimeSpent: number;
  enrolledCourses: number;
  completedCourses: number;
  achievementsUnlocked: number;
}

export interface DailyGoal {
  id: string;
  type: 'xp' | 'lessons' | 'streak' | 'games';
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

export interface UserState {
  stats: UserStats | null;
  dailyGoals: DailyGoal[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchDailyGoals: () => Promise<void>;
  updateLocalStats: (updates: Partial<UserStats>) => void;
  completeDailyGoal: (goalId: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  stats: null,
  dailyGoals: [],
  isLoading: false,
  error: null,

  fetchStats: async (getToken?: () => Promise<string | null>) => {
    try {
      set({ isLoading: true, error: null });
      if (getToken) {
        const response = await clerkFetchAPI<{ stats: any }>('/user/stats', getToken);
        set({ stats: response.stats as UserStats, isLoading: false });
      } else {
        // Fallback without getToken - use raw fetchAPI (no token refresh)
        const response = await fetchAPI<{ stats: any }>('/user/stats');
        set({ stats: response.stats as UserStats, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar estadísticas',
        isLoading: false 
      });
    }
  },

  fetchDailyGoals: async (getToken?: () => Promise<string | null>) => {
    try {
      if (getToken) {
        const response = await clerkFetchAPI<{ data: { dailyGoals: DailyGoal[]; summary: any } }>('/daily-goals', getToken);
        set({ dailyGoals: response.data.dailyGoals });
      } else {
        const response = await fetchAPI<{ data: { dailyGoals: DailyGoal[]; summary: any } }>('/daily-goals');
        set({ dailyGoals: response.data.dailyGoals });
      }
    } catch (error) {
      console.error('Error fetching daily goals:', error);
      set({ dailyGoals: [] });
    }
  },

  updateLocalStats: (updates) => {
    const currentStats = get().stats;
    if (currentStats) {
      set({ stats: { ...currentStats, ...updates } });
    }
  },

  completeDailyGoal: async (goalId: string, getToken?: () => Promise<string | null>) => {
    try {
      // Call the API to claim the reward
      if (getToken) {
        await clerkFetchAPI<{ data: { xpEarned: number; coinsEarned: number; user: any } }>(
          `/daily-goals/claim/${goalId}`,
          getToken,
          { method: 'POST' }
        );
      } else {
        await fetchAPI<{ data: { xpEarned: number; coinsEarned: number; user: any } }>(
          `/daily-goals/claim/${goalId}`,
          { method: 'POST' }
        );
      }
      
      // Update local state
      const goals = get().dailyGoals.map(goal => 
        goal.id === goalId ? { ...goal, completed: true, current: goal.target } : goal
      );
      set({ dailyGoals: goals });
      
      // Refresh stats to get updated XP
      get().fetchStats();
    } catch (error) {
      console.error('Error claiming daily goal:', error);
    }
  },
}));

// XP utility functions
export const calculateLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpToNextLevel = (xp: number): number => XP_PER_LEVEL - (xp % XP_PER_LEVEL);
export const progressToNextLevel = (xp: number): number => (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;