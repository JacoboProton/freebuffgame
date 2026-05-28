const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  clerkToken?: string | null;
}

class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, clerkToken, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add Clerk token if provided (for Clerk/Google OAuth users)
    // Priority: 1. clerkToken param, 2. __session cookie (which is a proper JWT)
    if (clerkToken) {
      headers['Authorization'] = `Bearer ${clerkToken}`;
    } else {
      // Try to get __session cookie directly for Clerk auth
      // This cookie contains a proper JWT that our backend can verify
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('__session='));
      if (sessionCookie) {
        const token = sessionCookie.split('=')[1]?.trim();
        // Only use if it looks like a JWT (starts with eyJ)
        if (token && token.startsWith('eyJ')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({ message: 'Invalid response' }));

    if (!response.ok) {
      // 4xx errors - show the message from server
      if (response.status >= 400 && response.status < 500) {
        throw new APIError(data.message || 'Error de cliente', response.status);
      }
      // 5xx errors - show generic message
      throw new APIError('Error del servidor. Por favor intenta de nuevo.', response.status);
    }

    return data;
  } catch (err) {
    if (err instanceof APIError) throw err;
    // Network errors (no internet, etc)
    throw new APIError('Error de conexión. Verifica tu internet.', 0);
  }
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    fetchAPI<{ user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    fetchAPI<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  logout: () =>
    fetchAPI<{ message: string }>('/auth/logout', { method: 'POST' }),
  
  me: () =>
    fetchAPI<{ user: any }>('/auth/me'),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: { category?: string; difficulty?: string; search?: string }) =>
    fetchAPI<{ courses: any[] }>('/courses', { params }),
  
  getById: (id: string) =>
    fetchAPI<{ course: any }>(`/courses/${id}`),
  
  enroll: (courseId: string) =>
    fetchAPI<{ enrollment: any }>(`/courses/${courseId}/enroll`, { method: 'POST' }),
  
  getEnrollments: () =>
    fetchAPI<{ enrollments: any[] }>('/courses/user/enrollments'),
};

// Lessons API
export const lessonsAPI = {
  getById: (id: string) =>
    fetchAPI<{ lesson: any; progress: any }>(`/lessons/${id}`),
  
  submitProgress: (lessonId: string, data: { score: number; timeSpent: number; answers?: any[] }) =>
    fetchAPI<{ progress: any; user?: any; leveledUp?: boolean; newLevel?: number; courseCompleted?: boolean }>(
      `/lessons/${lessonId}/progress`,
      { method: 'POST', body: JSON.stringify(data) }
    ),
};

// User API
export const userAPI = {
  getStats: () =>
    fetchAPI<{ stats: any }>('/user/stats'),
  
  getProfile: () =>
    fetchAPI<{ user: any }>('/user/profile'),
  
  updateAvatar: (avatar: string) =>
    fetchAPI<{ user: any }>('/user/avatar', { method: 'PATCH', body: JSON.stringify({ avatar }) }),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: (params?: { period?: string; limit?: string }) =>
    fetchAPI<{ leaderboard: any[]; userRank?: any }>('/leaderboard', { params }),
  
  getFriends: () =>
    fetchAPI<{ leaderboard: any[] }>('/leaderboard/friends'),
};

// Achievements API
export const achievementsAPI = {
  getAll: () =>
    fetchAPI<{ achievements: any[]; unlockedCount: number; totalCount: number }>('/achievements'),
};

// Games API
export const gamesAPI = {
  getAll: () =>
    fetchAPI<{ games: any[] }>('/games'),
  
  submitScore: (gameId: string, score: number) =>
    fetchAPI<{ gameScore: { score: number; isNewHighScore: boolean } }>(
      `/games/${gameId}/score`,
      { method: 'POST', body: JSON.stringify({ score }) }
    ),
};

// Shop API
export const shopAPI = {
  getItems: () =>
    fetchAPI<{ items: any[] }>('/shop/items'),
  
  purchase: (itemId: string) =>
    fetchAPI<{ purchased: any }>('/shop/purchase', { method: 'POST', body: JSON.stringify({ itemId }) }),
  
  checkout: (packageId: string) =>
    fetchAPI<{ checkoutUrl: string; coins: number; price: number }>(
      '/shop/checkout',
      { method: 'POST', body: JSON.stringify({ packageId }) }
    ),
};

// Payments API
export const paymentsAPI = {
  getStatus: () =>
    fetchAPI<{ stripeConfigured: boolean }>('/payments/status'),

  getCoursePrice: (courseId: string, clerkToken?: string) =>
    fetchAPI<{
      courseId: string;
      title: string;
      isPurchased: boolean;
      isPro: boolean;
      price: number;
      requiredLevel: number;
      meetsLevelRequirement: boolean;
      userLevel: number;
    }>(`/payments/course/${courseId}/price`, { clerkToken }),

  checkout: (courseId: string, clerkToken?: string) =>
    fetchAPI<{ checkoutUrl: string; sessionId: string }>(
      `/payments/course/${courseId}/checkout`,
      { method: 'POST', clerkToken }
    ),

  confirm: (sessionId: string, courseId: string, clerkToken?: string) =>
    fetchAPI<{ purchased: boolean; enrollment: any }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ sessionId, courseId }),
      clerkToken,
    }),

  getPurchases: (clerkToken?: string) =>
    fetchAPI<{ purchases: any[] }>('/payments/purchases', { clerkToken }),
};

export { fetchAPI };