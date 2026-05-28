import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticate, requireAdmin);

// Get dashboard stats
adminRouter.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCompletions,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completed: true } }),
      prisma.user.findMany({
        where: { role: 'user' },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalCompletions,
          completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
        },
        recentUsers,
      },
    });
  } catch (err) {
    next(err);
  }
});

// CRUD for courses
adminRouter.post('/courses', async (req: AuthRequest, res, next) => {
  try {
    const { title, description, category, difficulty, estimatedHours, imageUrl } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        difficulty: difficulty || 'beginner',
        estimatedHours: estimatedHours || 1,
        imageUrl,
        isPublished: false,
      },
    });

    res.status(201).json({ status: 'success', data: { course } });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/courses', async (req: AuthRequest, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ status: 'success', data: { courses } });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/courses/:id', async (req: AuthRequest, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    res.json({ status: 'success', data: { course } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/courses/:id', async (req: AuthRequest, res, next) => {
  try {
    const { title, description, category, difficulty, estimatedHours, imageUrl, isPublished } = req.body;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        difficulty,
        estimatedHours,
        imageUrl,
        isPublished,
      },
    });

    res.json({ status: 'success', data: { course } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/courses/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Curso eliminado' });
  } catch (err) {
    next(err);
  }
});

// CRUD for modules
adminRouter.post('/courses/:courseId/modules', async (req: AuthRequest, res, next) => {
  try {
    const { title, order } = req.body;

    const module = await prisma.module.create({
      data: {
        courseId: req.params.courseId,
        title,
        order: order || 0,
      },
    });

    res.status(201).json({ status: 'success', data: { module } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/modules/:id', async (req: AuthRequest, res, next) => {
  try {
    const { title, order } = req.body;

    const module = await prisma.module.update({
      where: { id: req.params.id },
      data: { title, order },
    });

    res.json({ status: 'success', data: { module } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/modules/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.module.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Módulo eliminado' });
  } catch (err) {
    next(err);
  }
});

// CRUD for lessons
adminRouter.post('/modules/:moduleId/lessons', async (req: AuthRequest, res, next) => {
  try {
    const { title, type, content, xpReward, order } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: req.params.moduleId,
        title,
        type,
        content,
        xpReward: xpReward || 20,
        order: order || 0,
      },
    });

    res.status(201).json({ status: 'success', data: { lesson } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/lessons/:id', async (req: AuthRequest, res, next) => {
  try {
    const { title, type, content, xpReward, order } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: { title, type, content, xpReward, order },
    });

    res.json({ status: 'success', data: { lesson } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/lessons/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.lesson.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Lección eliminada' });
  } catch (err) {
    next(err);
  }
});

// User management
adminRouter.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where: any = { role: 'user' };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          xp: true,
          level: true,
          currentStreak: true,
          createdAt: true,
          lastActiveAt: true,
          _count: { select: { enrollments: true, achievements: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        enrollments: {
          include: { course: { select: { title: true, category: true } } },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: 'desc' },
          take: 10,
        },
        gameScores: {
          include: { game: true },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            enrollments: true,
            achievements: true,
            gameScores: true,
            purchases: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const { name, xp, level, coins, currentStreak, longestStreak, role } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(xp !== undefined && { xp }),
        ...(level !== undefined && { level }),
        ...(coins !== undefined && { coins }),
        ...(currentStreak !== undefined && { currentStreak }),
        ...(longestStreak !== undefined && { longestStreak }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
});

// Analytics
adminRouter.get('/analytics', async (req: AuthRequest, res, next) => {
  try {
    const [
      totalUsers,
      activeUsersLast7Days,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalCompletions,
      totalLessonsCompleted,
      totalAchievementsUnlocked,
      totalGameSessions,
      revenueData,
      userGrowth,
      categoryStats,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({
        where: {
          role: 'user',
          lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completed: true } }),
      prisma.lessonProgress.count({ where: { completed: true } }),
      prisma.userAchievement.count(),
      prisma.gameScore.count(),
      prisma.coursePurchase.findMany({
        select: { amountPaid: true, purchasedAt: true },
        orderBy: { purchasedAt: 'desc' },
        take: 30,
      }),
      prisma.user.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.course.findMany({
        select: {
          category: true,
          enrollments: { select: { id: true, completed: true } },
        },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum, p) => sum + p.amountPaid, 0) / 100;

    // Calculate user growth by month
    const userGrowthByMonth: Record<string, number> = {};
    userGrowth.forEach((user) => {
      const month = user.createdAt.toISOString().substring(0, 7);
      userGrowthByMonth[month] = (userGrowthByMonth[month] || 0) + 1;
    });

    // Calculate category stats
    const categoryStatsMap: Record<string, { enrollments: number; completions: number }> = {};
    categoryStats.forEach((course) => {
      if (!categoryStatsMap[course.category]) {
        categoryStatsMap[course.category] = { enrollments: 0, completions: 0 };
      }
      categoryStatsMap[course.category].enrollments += course.enrollments.length;
      categoryStatsMap[course.category].completions += course.enrollments.filter((e) => e.completed).length;
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsersLast7Days,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          totalCompletions,
          totalLessonsCompleted,
          totalAchievementsUnlocked,
          totalGameSessions,
          completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
          activeRate: totalUsers > 0 ? Math.round((activeUsersLast7Days / totalUsers) * 100) : 0,
        },
        revenue: {
          total: totalRevenue,
          transactions: revenueData.length,
        },
        userGrowth: userGrowthByMonth,
        categoryStats: categoryStatsMap,
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/analytics/courses', async (req: AuthRequest, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true, purchases: true },
        },
        enrollments: {
          select: { completed: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseAnalytics = courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      isPublished: course.isPublished,
      isPro: course.isPro,
      price: course.price,
      totalEnrollments: course._count.enrollments,
      totalCompletions: course.enrollments.filter((e) => e.completed).length,
      totalPurchases: course._count.purchases,
      completionRate:
        course._count.enrollments > 0
          ? Math.round((course.enrollments.filter((e) => e.completed).length / course._count.enrollments) * 100)
          : 0,
    }));

    res.json({ status: 'success', data: { courses: courseAnalytics } });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/analytics/users', async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        currentStreak: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            enrollments: true,
            achievements: true,
            gameScores: true,
          },
        },
      },
      orderBy: { xp: 'desc' },
      take: 50,
    });

    // Group by level
    const levelDistribution: Record<number, number> = {};
    const xpDistribution: { range: string; count: number }[] = [
      { range: '0-100', count: 0 },
      { range: '101-500', count: 0 },
      { range: '501-1000', count: 0 },
      { range: '1001-5000', count: 0 },
      { range: '5000+', count: 0 },
    ];

    users.forEach((user) => {
      levelDistribution[user.level] = (levelDistribution[user.level] || 0) + 1;

      if (user.xp <= 100) xpDistribution[0].count++;
      else if (user.xp <= 500) xpDistribution[1].count++;
      else if (user.xp <= 1000) xpDistribution[2].count++;
      else if (user.xp <= 5000) xpDistribution[3].count++;
      else xpDistribution[4].count++;
    });

    res.json({
      status: 'success',
      data: {
        topUsers: users.slice(0, 20),
        levelDistribution,
        xpDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// CONTENT MODERATION
// ===========================================

adminRouter.get('/moderation/reports', async (req: AuthRequest, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (status !== 'all') {
      where.status = String(status);
    }

    const [reports, total] = await Promise.all([
      prisma.contentReport.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.contentReport.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/moderation/reports/:id', async (req: AuthRequest, res, next) => {
  try {
    const { status, actionTaken } = req.body;

    const updateData: any = {
      status,
      reviewedBy: req.user!.id,
      reviewedAt: new Date(),
    };
    if (actionTaken) {
      updateData.actionTaken = actionTaken;
    }

    const report = await prisma.contentReport.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ status: 'success', data: { report } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/moderation/reports/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.contentReport.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Reporte eliminado' });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/moderation/reports', async (req: AuthRequest, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const report = await prisma.contentReport.create({
      data: {
        reporterId: req.user!.id,
        targetType,
        targetId,
        reason,
        description,
        status: 'pending',
      },
    });

    res.status(201).json({ status: 'success', data: { report } });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// SYSTEM SETTINGS
// ===========================================

adminRouter.get('/settings', async (req: AuthRequest, res, next) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) {
      where.category = String(category);
    }

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    res.json({ status: 'success', data: { settings } });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/settings/public', async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { isPublic: true },
    });

    // Convert to key-value object
    const settingsObj: Record<string, any> = {};
    settings.forEach((s) => {
      if (s.type === 'number') settingsObj[s.key] = Number(s.value);
      else if (s.type === 'boolean') settingsObj[s.key] = s.value === 'true';
      else if (s.type === 'json') settingsObj[s.key] = JSON.parse(s.value);
      else settingsObj[s.key] = s.value;
    });

    res.json({ status: 'success', data: settingsObj });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/settings/:key', async (req: AuthRequest, res, next) => {
  try {
    const { value, type, category, label, description, isPublic } = req.body;

    const setting = await prisma.systemSetting.upsert({
      where: { key: req.params.key },
      create: {
        key: req.params.key,
        value,
        type: type || 'string',
        category: category || 'general',
        label: label || req.params.key,
        description,
        isPublic: isPublic || false,
      },
      update: {
        value,
        ...(type && { type }),
        ...(category && { category }),
        ...(label && { label }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json({ status: 'success', data: { setting } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/settings/:key', async (req: AuthRequest, res, next) => {
  try {
    await prisma.systemSetting.delete({
      where: { key: req.params.key },
    });

    res.json({ status: 'success', message: 'Configuración eliminada' });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// NOTIFICATIONS
// ===========================================

adminRouter.get('/notifications', async (req: AuthRequest, res, next) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (type) where.type = String(type);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/notifications', async (req: AuthRequest, res, next) => {
  try {
    const { userId, type, title, message, data } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId: userId || null,
        type: type || 'broadcast',
        title,
        message,
        data: data || null,
      },
    });

    res.status(201).json({ status: 'success', data: { notification } });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/notifications/broadcast', async (req: AuthRequest, res, next) => {
  try {
    const { title, message, data } = req.body;

    // Get all user IDs
    const users = await prisma.user.findMany({
      select: { id: true },
      where: { role: 'user' },
    });

    // Create notifications for all users
    const notifications = await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: 'broadcast',
        title,
        message,
        data: data || null,
      })),
    });

    res.status(201).json({
      status: 'success',
      data: {
        count: notifications.count,
        message: `Notificación enviada a ${notifications.count} usuarios`,
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/notifications/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ status: 'success', data: { notification } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/notifications/read-all', async (req: AuthRequest, res, next) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ status: 'success', data: { count: result.count } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/notifications/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Notificación eliminada' });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/notifications/clear-all', async (req: AuthRequest, res, next) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: { isRead: true },
    });

    res.json({ status: 'success', data: { count: result.count } });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// NOTIFICATION TEMPLATES
// ===========================================

adminRouter.get('/notifications/templates', async (req: AuthRequest, res, next) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { key: 'asc' },
    });

    res.json({ status: 'success', data: { templates } });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/notifications/templates', async (req: AuthRequest, res, next) => {
  try {
    const { key, title, message, type, variables, isActive } = req.body;

    const template = await prisma.notificationTemplate.create({
      data: {
        key,
        title,
        message,
        type: type || 'system',
        variables: variables || [],
        isActive: isActive !== false,
      },
    });

    res.status(201).json({ status: 'success', data: { template } });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/notifications/templates/:key', async (req: AuthRequest, res, next) => {
  try {
    const { title, message, type, variables, isActive } = req.body;

    const template = await prisma.notificationTemplate.update({
      where: { key: req.params.key },
      data: {
        ...(title && { title }),
        ...(message && { message }),
        ...(type && { type }),
        ...(variables && { variables }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ status: 'success', data: { template } });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/notifications/templates/:key', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notificationTemplate.delete({
      where: { key: req.params.key },
    });

    res.json({ status: 'success', message: 'Plantilla eliminada' });
  } catch (err) {
    next(err);
  }
});