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