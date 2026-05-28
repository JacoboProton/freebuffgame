import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';

export const coursesRouter = Router();

// Get all published courses
coursesRouter.get('/', async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;

    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        modules: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user level if authenticated (from header or just default)
    // For list view, we show PRO status but don't filter by level
    const coursesWithStats = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      imageUrl: course.imageUrl,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      isPro: course.isPro,
      price: course.price,
      requiredLevel: course.requiredLevel,
      modulesCount: course.modules.length,
      lessonsCount: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      studentsCount: course._count.enrollments,
    }));

    res.json({ status: 'success', data: { courses: coursesWithStats } });
  } catch (err) {
    next(err);
  }
});

// Get course by ID with modules and lessons (public info, protected content)
coursesRouter.get('/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                xpReward: true,
                order: true,
              },
            },
          },
        },
      },
    });

    if (!course || !course.isPublished) {
      throw new AppError('Curso no encontrado', 404);
    }

    // Base response - public info
    const response: any = {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        imageUrl: course.imageUrl,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours,
        isPro: course.isPro,
        price: course.price,
        requiredLevel: course.requiredLevel,
      },
    };

    // If user is authenticated, check access for full content
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { level: true },
        });

        // Get purchase status
        const purchase = await prisma.coursePurchase.findUnique({
          where: {
            userId_courseId: {
              userId: decoded.id,
              courseId: course.id,
            },
          },
        });

        const hasAccess = !course.isPro || !!purchase || (course.requiredLevel > 0 && user && user.level >= course.requiredLevel);

        response.access = {
          hasAccess,
          needsPurchase: course.isPro && !purchase,
          userLevel: user?.level || 1,
          requiredLevel: course.requiredLevel,
          isPro: course.isPro,
          price: course.price,
        };

        // Only include full content (modules/lessons) if user has access
        if (hasAccess) {
          response.course.modules = course.modules;
        } else {
          // Show limited preview
          response.course.modules = course.modules.slice(0, 1).map((m: any) => ({
            ...m,
            lessons: m.lessons.slice(0, 1), // Only first lesson preview
          }));
          response.previewOnly = true;
        }
      } catch (err) {
        // Invalid token, just show public info
        response.access = { hasAccess: !course.isPro, needsPurchase: course.isPro };
      }
    } else {
      // Not authenticated
      response.access = { hasAccess: !course.isPro, needsPurchase: course.isPro };
    }

    res.json({ status: 'success', data: response });
  } catch (err) {
    next(err);
  }
});

// Enroll in a course
coursesRouter.post('/:id/enroll', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId: course.id } },
    });

    if (existing) {
      throw new AppError('Ya estás enrolled en este curso', 400);
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: req.user!.id, courseId: course.id },
    });

    // Give some starting coins
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { coins: { increment: 10 } },
    });

    res.status(201).json({ status: 'success', data: { enrollment } });
  } catch (err) {
    next(err);
  }
});

// Get user's enrolled courses
coursesRouter.get('/user/enrollments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.modules.reduce(
          (acc, m) => acc + m.lessons.length,
          0
        );

        const completedProgress = await prisma.lessonProgress.count({
          where: {
            userId: req.user!.id,
            lessonId: { in: enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id)) },
            completed: true,
          },
        });

        return {
          id: enrollment.id,
          courseId: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          imageUrl: enrollment.course.imageUrl,
          difficulty: enrollment.course.difficulty,
          startedAt: enrollment.startedAt,
          completed: enrollment.completed,
          progress: totalLessons > 0 ? Math.round((completedProgress / totalLessons) * 100) : 0,
          completedLessons: completedProgress,
          totalLessons,
        };
      })
    );

    res.json({ status: 'success', data: { enrollments: enrollmentsWithProgress } });
  } catch (err) {
    next(err);
  }
});