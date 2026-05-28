import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import crypto from 'crypto';

export const certificatesRouter = Router();

// Generate certificate number
function generateCertificateNumber(): string {
  const prefix = 'CERT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate verification code
function generateVerificationCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Get certificate for a course completion
certificatesRouter.post('/generate/:courseId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { include: { lessons: true } } }
    });

    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      return res.status(400).json({ status: 'error', message: 'Not enrolled in this course' });
    }

    // Check if course is completed (all lessons done)
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = await prisma.lessonProgress.count({
      where: { userId, lessonId: { in: course.modules.flatMap(m => m.lessons.map(l => l.id)) }, completed: true }
    });

    if (completedLessons < totalLessons) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Course not completed. ${completedLessons}/${totalLessons} lessons completed` 
      });
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (existingCert) {
      return res.json({
        status: 'success',
        data: { certificate: existingCert }
      });
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber: generateCertificateNumber(),
        verificationCode: generateVerificationCode(),
        metadata: {
          totalLessons,
          completedLessons,
          completedAt: new Date().toISOString(),
          courseTitle: course.title,
          courseCategory: course.category
        }
      },
      include: {
        course: { select: { title: true, category: true, imageUrl: true } }
      }
    });

    res.json({ status: 'success', data: { certificate } });
  } catch (err) {
    next(err);
  }
});

// Get user's certificates
certificatesRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user!.id },
      include: {
        course: { select: { title: true, category: true, imageUrl: true } }
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.json({ status: 'success', data: { certificates } });
  } catch (err) {
    next(err);
  }
});

// Get certificate by verification code (public)
certificatesRouter.get('/verify/:code', async (req: AuthRequest, res, next) => {
  try {
    const { code } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        course: { select: { title: true, category: true } },
        user: { select: { name: true, avatar: true } }
      }
    });

    if (!certificate) {
      return res.status(404).json({ status: 'error', message: 'Certificate not found' });
    }

    // Return limited public info
    res.json({
      status: 'success',
      data: {
        valid: true,
        holderName: certificate.user.name,
        courseName: certificate.course.title,
        issuedAt: certificate.issuedAt,
        certificateNumber: certificate.certificateNumber
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get certificate by ID
certificatesRouter.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        course: { select: { title: true, category: true, imageUrl: true, description: true } },
        user: { select: { name: true, avatar: true } }
      }
    });

    if (!certificate) {
      return res.status(404).json({ status: 'error', message: 'Certificate not found' });
    }

    // Check ownership unless admin
    if (certificate.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    res.json({ status: 'success', data: { certificate } });
  } catch (err) {
    next(err);
  }
});