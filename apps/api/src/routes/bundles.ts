import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const bundlesRouter = Router();

// Get all active bundles
bundlesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true, imageUrl: true, category: true }
            }
          },
          orderBy: { courseOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'success', data: { bundles } });
  } catch (err) {
    next(err);
  }
});

// Get single bundle
bundlesRouter.get('/:bundleId', async (req: AuthRequest, res, next) => {
  try {
    const { bundleId } = req.params;

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        courses: {
          include: {
            course: {
              select: { 
                id: true, title: true, description: true, imageUrl: true,
                category: true, difficulty: true, estimatedHours: true
              }
            }
          },
          orderBy: { courseOrder: 'asc' }
        }
      }
    });

    if (!bundle) {
      return res.status(404).json({ status: 'error', message: 'Bundle not found' });
    }

    // Get total value of courses
    const coursesValue = await prisma.course.aggregate({
      where: { id: { in: bundle.courses.map(bc => bc.courseId) } },
      _count: true
    });

    res.json({
      status: 'success',
      data: {
        bundle,
        coursesCount: coursesValue._count,
        savings: bundle.originalPrice 
          ? bundle.originalPrice - bundle.price 
          : null
      }
    });
  } catch (err) {
    next(err);
  }
});

// Check if user purchased bundle
bundlesRouter.get('/:bundleId/purchased', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { bundleId } = req.params;
    const userId = req.user!.id;

    const purchase = await prisma.bundlePurchase.findUnique({
      where: { userId_bundleId: { userId, bundleId } }
    });

    res.json({ status: 'success', data: { purchased: !!purchase } });
  } catch (err) {
    next(err);
  }
});

// Create Stripe checkout for bundle
bundlesRouter.post('/:bundleId/checkout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { bundleId } = req.params;
    const userId = req.user!.id;

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: { courses: { include: { course: true } } }
    });

    if (!bundle || !bundle.isActive) {
      return res.status(404).json({ status: 'error', message: 'Bundle not found or inactive' });
    }

    // Check if already purchased
    const existingPurchase = await prisma.bundlePurchase.findUnique({
      where: { userId_bundleId: { userId, bundleId } }
    });

    if (existingPurchase) {
      return res.status(400).json({ status: 'error', message: 'Bundle already purchased' });
    }

    // Get user for checkout
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Create Stripe checkout session
    const stripe = await import('../services/stripe.js').then(m => m.stripe);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: bundle.title,
            description: `${bundle.courses.length} cursos incluidos`,
            images: bundle.imageUrl ? [bundle.imageUrl] : undefined
          },
          unit_amount: bundle.price
        },
        quantity: 1
      }],
      metadata: {
        userId,
        bundleId,
        type: 'bundle'
      },
      success_url: `${process.env.FRONTEND_URL}/bundles/${bundleId}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/bundles/${bundleId}`
    });

    res.json({ status: 'success', data: { sessionId: session.id, url: session.url } });
  } catch (err) {
    next(err);
  }
});

// Admin: Create bundle
bundlesRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const { title, description, imageUrl, price, originalPrice, courseIds } = req.body;

    const bundle = await prisma.bundle.create({
      data: {
        title,
        description,
        imageUrl,
        price,
        originalPrice,
        discountPercent: originalPrice ? Math.round((1 - price / originalPrice) * 100) : null,
        courses: {
          create: courseIds.map((courseId: string, index: number) => ({
            courseId,
            courseOrder: index
          }))
        }
      },
      include: {
        courses: { include: { course: true } }
      }
    });

    res.json({ status: 'success', data: { bundle } });
  } catch (err) {
    next(err);
  }
});

// Admin: Update bundle
bundlesRouter.patch('/:bundleId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin only' });
    }

    const { bundleId } = req.params;
    const { title, description, imageUrl, price, originalPrice, isActive, courseIds } = req.body;

    // Update bundle
    const bundle = await prisma.bundle.update({
      where: { id: bundleId },
      data: {
        title,
        description,
        imageUrl,
        price,
        originalPrice,
        discountPercent: originalPrice ? Math.round((1 - price / originalPrice) * 100) : undefined,
        isActive
      }
    });

    // Update courses if provided
    if (courseIds) {
      await prisma.bundleCourse.deleteMany({ where: { bundleId } });
      await prisma.bundleCourse.createMany({
        data: courseIds.map((courseId: string, index: number) => ({
          bundleId,
          courseId,
          courseOrder: index
        }))
      });
    }

    const updatedBundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: { courses: { include: { course: true } } }
    });

    res.json({ status: 'success', data: { bundle: updatedBundle } });
  } catch (err) {
    next(err);
  }
});