import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().nullable(),
  xp: z.number().default(0),
  level: z.number().default(1),
  coins: z.number().default(0),
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  lastActiveAt: z.date(),
  createdAt: z.date(),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

// Course schemas
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  imageUrl: z.string().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number(),
  isPublished: z.boolean(),
  createdAt: z.date(),
});

export const ModuleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  order: z.number(),
});

export const LessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  type: z.enum(['multiple_choice', 'fill_blank', 'matching', 'typing', 'game', 'true_false']),
  content: z.any(),
  xpReward: z.number().default(20),
  order: z.number(),
});

// Progress schemas
export const LessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.string(),
  completed: z.boolean().default(false),
  score: z.number().default(0),
  xpEarned: z.number().default(0),
  timeSpent: z.number().default(0),
  attempts: z.number().default(0),
  completedAt: z.date().nullable(),
});

export const SubmitProgressSchema = z.object({
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  answers: z.array(z.any()).optional(),
});

// Achievement schemas
export const AchievementSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  xpReward: z.number().default(10),
});

export const UserAchievementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  achievementId: z.string(),
  unlockedAt: z.date(),
});

// Leaderboard
export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  userId: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  xp: z.number(),
  level: z.number(),
  isCurrentUser: z.boolean().default(false),
});

// API Response types
export type User = z.infer<typeof UserSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type UserAchievement = z.infer<typeof UserAchievementSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// Question content types
export interface MultipleChoiceContent {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FillBlankContent {
  sentence: string;
  correctAnswer: string;
  hint?: string;
}

export interface MatchingContent {
  pairs: Array<{ left: string; right: string }>;
}

export interface TrueFalseContent {
  statement: string;
  correctAnswer: boolean;
}

// Utility types
export const XP_PER_LEVEL = 500;
export const calculateLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpToNextLevel = (xp: number): number => XP_PER_LEVEL - (xp % XP_PER_LEVEL);
export const progressToNextLevel = (xp: number): number => (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;