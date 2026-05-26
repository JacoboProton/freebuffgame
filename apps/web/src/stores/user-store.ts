import { create } from 'zustand';
import { userAPI, fetchAPI } from '@/lib/api-client';

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

  fetchStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await userAPI.getStats();
      set({ stats: response.stats as UserStats, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar estadísticas',
        isLoading: false 
      });
    }
  },

  fetchDailyGoals: async () => {
    try {
      const response = await fetchAPI<{ data: { dailyGoals: DailyGoal[]; summary: any } }>('/daily-goals');
      set({ dailyGoals: response.data.dailyGoals });
    } catch (error) {
      console.error('Error fetching daily goals:', error);
      // Fallback to empty goals if API fails
      set({ dailyGoals: [] });
    }
  },

  updateLocalStats: (updates) => {
    const currentStats = get().stats;
    if (currentStats) {
      set({ stats: { ...currentStats, ...updates } });
    }
  },

  completeDailyGoal: async (goalId) => {
    try {
      // Call the API to claim the reward
      await fetchAPI<{ data: { xpEarned: number; coinsEarned: number; user: any } }>(
        `/daily-goals/claim/${goalId}`,
        { method: 'POST' }
      );
      
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