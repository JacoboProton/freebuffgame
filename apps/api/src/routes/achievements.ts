import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { LEGENDARY_KEYS, FINAL_EXAM_LESSON_IDS, SPEED_MASTER_MAX_SECONDS } from '../lib/legendary.js';

export const achievementsRouter = Router();

// Get all achievements with user's unlocked status
achievementsRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { key: 'asc' },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.user!.id },
      select: { achievementId: true, unlockedAt: true },
    });

    const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

    const achievementsWithStatus = achievements.map((achievement) => ({
      id: achievement.id,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
      unlockedAt: unlockedMap.get(achievement.id) || null,
    }));

    const unlockedCount = achievementsWithStatus.filter((a) => a.unlockedAt).length;

    res.json({
      status: 'success',
      data: {
        achievements: achievementsWithStatus,
        unlockedCount,
        totalCount: achievements.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get legendary achievement progress for the current user
achievementsRouter.get('/legendary-progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all legendary achievements
    const legendaryAchievements = await prisma.achievement.findMany({
      where: { key: { in: LEGENDARY_KEYS } },
    });

    // Get user's unlocked legendary achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId, achievement: { key: { in: LEGENDARY_KEYS } } },
      include: { achievement: { select: { key: true } } },
    });

    const unlockedKeys = new Set(userAchievements.map(ua => ua.achievement.key));

    // --- Progress metrics ---

    // 1. Final exams completed (for all_final_exams)
    const completedFinalExams = await prisma.lessonProgress.count({
      where: { userId, completed: true, lessonId: { in: FINAL_EXAM_LESSON_IDS } },
    });

    // 2. Perfect final exams (for perfect_final_exams)
    const perfectFinalExams = await prisma.lessonProgress.count({
      where: { userId, completed: true, score: 100, lessonId: { in: FINAL_EXAM_LESSON_IDS } },
    });

    // 3. Courses completed (for all_courses_complete)
    const totalCourses = await prisma.course.count({ where: { isPublished: true } });
    const completedCourses = await prisma.enrollment.count({ where: { userId, completed: true } });

    // 4. Total time on final exams in seconds (for speed_master)
    const timeAgg = await prisma.lessonProgress.aggregate({
      where: { userId, lessonId: { in: FINAL_EXAM_LESSON_IDS } },
      _sum: { timeSpent: true },
    });
    const totalTimeOnExams = timeAgg._sum.timeSpent || 0;

    // 5. Coding/project lessons completed (for code_master)
    const totalCodingLessons = await prisma.lesson.count({
      where: { type: { in: ['coding', 'project'] } },
    });
    const completedCodingLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        lesson: { type: { in: ['coding', 'project'] } },
      },
    });

    // Build progress data for each legendary achievement
    const progress = legendaryAchievements.map(ach => {
      const unlocked = unlockedKeys.has(ach.key);
      let current = 0;
      let target = 0;
      let detail = '';

      switch (ach.key) {
        case 'all_final_exams':
          current = completedFinalExams;
          target = FINAL_EXAM_LESSON_IDS.length;
          detail = `${completedFinalExams}/${FINAL_EXAM_LESSON_IDS.length} exámenes aprobados`;
          break;
        case 'perfect_final_exams':
          current = perfectFinalExams;
          target = FINAL_EXAM_LESSON_IDS.length;
          detail = `${perfectFinalExams}/${FINAL_EXAM_LESSON_IDS.length} exámenes con 100%`;
          break;
        case 'all_courses_complete':
          current = completedCourses;
          target = totalCourses || 1;
          detail = `${completedCourses}/${totalCourses} cursos completados`;
          break;
        case 'speed_master':
          // Inverted: less time is better. current = time remaining before hitting limit.
          current = unlocked ? SPEED_MASTER_MAX_SECONDS : Math.max(0, SPEED_MASTER_MAX_SECONDS - totalTimeOnExams);
          target = SPEED_MASTER_MAX_SECONDS;
          const minsRemaining = Math.max(0, 60 - Math.round(totalTimeOnExams / 60));
          detail = unlocked ? '¡Completado!' : `${minsRemaining} min restantes de 60`;
          break;
        case 'code_master':
          current = completedCodingLessons;
          target = totalCodingLessons || 1;
          detail = `${completedCodingLessons}/${totalCodingLessons} ejercicios de código/proyecto`;
          break;
      }

      return {
        key: ach.key,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
        unlocked,
        current,
        target,
        percentage: Math.min(Math.round((current / target) * 100), 100),
        detail,
      };
    });

    const unlockedCount = progress.filter(p => p.unlocked).length;

    res.json({
      status: 'success',
      data: {
        achievements: progress,
        unlockedCount,
        totalCount: LEGENDARY_KEYS.length,
        // Additional raw metrics for the UI
        metrics: {
          completedFinalExams,
          totalFinalExams: FINAL_EXAM_LESSON_IDS.length,
          perfectFinalExams,
          completedCourses,
          totalCourses,
          totalTimeOnExamsSeconds: totalTimeOnExams,
          completedCodingLessons,
          totalCodingLessons,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});