import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const instructorsRouter = Router();

// Check if user is an approved instructor
instructorsRouter.get('/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const application = await prisma.instructorApplication.findUnique({
      where: { userId }
    });

    const isInstructor = req.user!.role === 'instructor' || req.user!.role === 'admin';

    res.json({
      status: 'success',
      data: {
        isInstructor,
        application: application || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// Apply to become an instructor
instructorsRouter.post('/apply', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { bio, expertise, portfolioUrl } = req.body;

    // Check if already has application
    const existing = await prisma.instructorApplication.findUnique({
      where: { userId }
    });

    if (existing) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Application already ${existing.status}` 
      });
    }

    const application = await prisma.instructorApplication.create({
      data: {
        userId,
        bio,
        expertise: expertise || [],
        portfolioUrl
      }
    });

    res.json({ status: 'success', data: { application } });
  } catch (err) {
    next(err);
  }
});

// Get instructor's courses
instructorsRouter.get('/courses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Only instructors and admins can manage courses
    if (req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Instructor access required' });
    }

    // Get courses created by this user
    // Note: Course model doesn't have createdBy field, so we'll need to check via modules or a different approach
    // For now, return courses that the user has content in
    
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        modules: {
          include: {
            lessons: { select: { id: true } }
          }
        },
        enrollments: { select: { id: true } },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter to instructor's courses (those with published modules/lessons)
    // For a full implementation, you'd add a creatorId field to Course
    
    res.json({ status: 'success', data: { courses } });
  } catch (err) {
    next(err);
  }
});

// Admin: Get pending applications
instructorsRouter.get('/admin/applications', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const { status = 'pending' } = req.query;

    const applications = await prisma.instructorApplication.findMany({
      where: { status: status as string },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'success', data: { applications } });
  } catch (err) {
    next(err);
  }
});

// Admin: Review application
instructorsRouter.patch('/admin/applications/:applicationId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const { applicationId } = req.params;
    const { approved, rejectionReason } = req.body;

    const application = await prisma.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status: approved ? 'approved' : 'rejected',
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        rejectionReason: approved ? null : rejectionReason
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // If approved, update user role
    if (approved) {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'instructor' }
      });
    }

    res.json({ status: 'success', data: { application } });
  } catch (err) {
    next(err);
  }
});

// Create a new course (instructor)
instructorsRouter.post('/courses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Instructor access required' });
    }

    const { title, description, category, difficulty, estimatedHours, imageUrl, modules } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        difficulty: difficulty || 'beginner',
        estimatedHours: estimatedHours || 1,
        imageUrl,
        isPublished: false, // Must be approved by admin
        modules: modules ? {
          create: modules.map((m: any, moduleIndex: number) => ({
            title: m.title,
            order: moduleIndex + 1,
            lessons: m.lessons ? {
              create: m.lessons.map((l: any, lessonIndex: number) => ({
                title: l.title,
                type: l.type || 'multiple_choice',
                content: l.content || {},
                xpReward: l.xpReward || 20,
                order: lessonIndex + 1
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        modules: {
          include: { lessons: true }
        }
      }
    });

    // Create initial version
    await prisma.courseVersion.create({
      data: {
        courseId: course.id,
        version: 1,
        changes: { action: 'created', modules: modules?.length || 0 },
        createdById: req.user!.id
      }
    });

    res.json({ status: 'success', data: { course } });
  } catch (err) {
    next(err);
  }
});

// Update course (instructor)
instructorsRouter.patch('/courses/:courseId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Instructor access required' });
    }

    const { courseId } = req.params;
    const updates = req.body;

    // Get current version
    const currentVersions = await prisma.courseVersion.findMany({
      where: { courseId },
      orderBy: { version: 'desc' },
      take: 1
    });
    const nextVersion = (currentVersions[0]?.version || 0) + 1;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: updates.title,
        description: updates.description,
        category: updates.category,
        difficulty: updates.difficulty,
        estimatedHours: updates.estimatedHours,
        imageUrl: updates.imageUrl
      }
    });

    // Create version record
    await prisma.courseVersion.create({
      data: {
        courseId,
        version: nextVersion,
        changes: updates,
        createdById: req.user!.id
      }
    });

    res.json({ status: 'success', data: { course, version: nextVersion } });
  } catch (err) {
    next(err);
  }
});