import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const reviewsRouter = Router();

// Get reviews for a course
reviewsRouter.get('/course/:courseId', async (req: AuthRequest, res, next) => {
  try {
    const { courseId } = req.params;
    const { approved = 'true' } = req.query;

    const reviews = await prisma.review.findMany({
      where: { 
        courseId,
        isApproved: approved === 'true'
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => ratingDistribution[r.rating as keyof typeof ratingDistribution]++);

    res.json({
      status: 'success',
      data: {
        reviews,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution
      }
    });
  } catch (err) {
    next(err);
  }
});

// Create or update a review
reviewsRouter.post('/course/:courseId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, title, content } = req.body;
    const userId = req.user!.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ status: 'error', message: 'Rating must be between 1 and 5' });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      return res.status(400).json({ status: 'error', message: 'Must be enrolled to review' });
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (existingReview) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, title, content, isApproved: false }, // Needs re-approval after edit
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      });
      return res.json({ status: 'success', data: { review, isUpdate: true } });
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId,
        courseId,
        rating,
        title,
        content,
        isApproved: true
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json({ status: 'success', data: { review, isUpdate: false } });
  } catch (err) {
    next(err);
  }
});

// Delete own review
reviewsRouter.delete('/:reviewId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    if (review.userId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Can only delete own reviews' });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    res.json({ status: 'success', message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

// Admin: Get pending reviews
reviewsRouter.get('/admin/pending', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'success', data: { reviews } });
  } catch (err) {
    next(err);
  }
});

// Admin: Approve or reject review
reviewsRouter.patch('/:reviewId/moderate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const { reviewId } = req.params;
    const { approved } = req.body;

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: approved },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, title: true } }
      }
    });

    res.json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
});