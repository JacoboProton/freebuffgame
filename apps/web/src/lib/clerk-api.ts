import { useAuth } from '@clerk/nextjs';
import { fetchAPI as baseFetchAPI, APIError } from './api-client';
import { useCallback, useMemo } from 'react';

// Re-export APIError for convenience
export { APIError };

// Hook that provides fetchAPI with automatic Clerk token refresh
export function useClerkAPI() {
  const { getToken } = useAuth();

  const fetchAPI = useCallback(async <T>(
    endpoint: string,
    options?: Parameters<typeof baseFetchAPI>[1]
  ): Promise<T> => {
    return baseFetchAPI<T>(endpoint, { ...options, getToken });
  }, [getToken]);

  return { fetchAPI };
}

// Standalone function for non-hook contexts (use with caution)
export async function clerkFetchAPI<T>(
  endpoint: string,
  getTokenFn: () => Promise<string | null>,
  options?: Parameters<typeof baseFetchAPI>[1]
): Promise<T> {
  return baseFetchAPI<T>(endpoint, { ...options, getToken: getTokenFn });
}

// Wrapper factory to create API objects with automatic token refresh
function createClerkAPI(getToken: () => Promise<string | null>) {
  return {
    // Auth API
    authAPI: {
      register: (data: { email: string; password: string; name: string }) =>
        baseFetchAPI<{ user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
      
      login: (data: { email: string; password: string }) =>
        baseFetchAPI<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
      
      logout: () =>
        baseFetchAPI<{ message: string }>('/auth/logout', { method: 'POST' }),
      
      me: () =>
        baseFetchAPI<{ user: any }>('/auth/me', { getToken }),
    },

    // Courses API
    coursesAPI: {
      getAll: (params?: { category?: string; difficulty?: string; search?: string }) =>
        baseFetchAPI<{ courses: any[] }>('/courses', { params, getToken }),
      
      getById: (id: string) =>
        baseFetchAPI<{ course: any }>(`/courses/${id}`, { getToken }),
      
      enroll: (courseId: string) =>
        baseFetchAPI<{ enrollment: any }>(`/courses/${courseId}/enroll`, { method: 'POST', getToken }),
      
      getEnrollments: () =>
        baseFetchAPI<{ enrollments: any[] }>('/courses/user/enrollments', { getToken }),
    },

    // Lessons API
    lessonsAPI: {
      getById: (id: string) =>
        baseFetchAPI<{ lesson: any; progress: any }>(`/lessons/${id}`, { getToken }),
      
      submitProgress: (lessonId: string, data: { score: number; timeSpent: number; answers?: any[] }) =>
        baseFetchAPI<{ progress: any; user?: any; leveledUp?: boolean; newLevel?: number; courseCompleted?: boolean }>(
          `/lessons/${lessonId}/progress`,
          { method: 'POST', body: JSON.stringify(data), getToken }
        ),
    },

    // User API
    userAPI: {
      getStats: () =>
        baseFetchAPI<{ stats: any }>('/user/stats', { getToken }),
      
      getProfile: () =>
        baseFetchAPI<{ user: any }>('/user/profile', { getToken }),
      
      updateAvatar: (avatar: string) =>
        baseFetchAPI<{ user: any }>('/user/avatar', { method: 'PATCH', body: JSON.stringify({ avatar }), getToken }),
    },

    // Leaderboard API
    leaderboardAPI: {
      getGlobal: (params?: { period?: string; limit?: string }) =>
        baseFetchAPI<{ leaderboard: any[]; userRank?: any }>('/leaderboard', { params, getToken }),
      
      getFriends: () =>
        baseFetchAPI<{ leaderboard: any[] }>('/leaderboard/friends', { getToken }),
    },

    // Achievements API
    achievementsAPI: {
      getAll: () =>
        baseFetchAPI<{ achievements: any[]; unlockedCount: number; totalCount: number }>('/achievements', { getToken }),
    },

    // Games API
    gamesAPI: {
      getAll: () =>
        baseFetchAPI<{ games: any[] }>('/games', { getToken }),
      
      submitScore: (gameId: string, score: number) =>
        baseFetchAPI<{ gameScore: { score: number; isNewHighScore: boolean } }>(
          `/games/${gameId}/score`,
          { method: 'POST', body: JSON.stringify({ score }), getToken }
        ),
    },

    // Shop API
    shopAPI: {
      getItems: () =>
        baseFetchAPI<{ items: any[] }>('/shop/items', { getToken }),
      
      purchase: (itemId: string) =>
        baseFetchAPI<{ purchased: any }>('/shop/purchase', { method: 'POST', body: JSON.stringify({ itemId }), getToken }),
      
      checkout: (packageId: string) =>
        baseFetchAPI<{ checkoutUrl: string; coins: number; price: number }>(
          '/shop/checkout',
          { method: 'POST', body: JSON.stringify({ packageId }), getToken }
        ),
    },

    // Payments API
    paymentsAPI: {
      getStatus: () =>
        baseFetchAPI<{ stripeConfigured: boolean }>('/payments/status', { getToken }),

      getCoursePrice: (courseId: string) =>
        baseFetchAPI<{
          courseId: string;
          title: string;
          isPurchased: boolean;
          isPro: boolean;
          price: number;
          requiredLevel: number;
          meetsLevelRequirement: boolean;
          userLevel: number;
        }>(`/payments/course/${courseId}/price`, { getToken }),

      checkout: (courseId: string) =>
        baseFetchAPI<{ status: string; data: { checkoutUrl: string; sessionId: string } }>(
          `/payments/course/${courseId}/checkout`,
          { method: 'POST', getToken }
        ),

      confirm: (sessionId: string, courseId: string) =>
        baseFetchAPI<{ purchased: boolean; enrollment: any }>('/payments/confirm', {
          method: 'POST',
          body: JSON.stringify({ sessionId, courseId }),
          getToken,
        }),

      getPurchases: () =>
        baseFetchAPI<{ purchases: any[] }>('/payments/purchases', { getToken }),
    },
  };
}

// Hook to get all API objects with automatic token refresh
export function useClerkAPIs() {
  const { getToken } = useAuth();

  return useMemo(() => createClerkAPI(getToken), [getToken]);
}