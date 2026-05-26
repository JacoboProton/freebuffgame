import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

export const shopRouter = Router();

// Get all shop items
shopRouter.get('/items', authenticate, async (req, res, next) => {
  try {
    const items = await prisma.shopItem.findMany({
      orderBy: { price: 'asc' },
    });

    // Get user's purchased items
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user!.id },
      select: { itemId: true },
    });

    const purchasedSet = new Set(purchases.map((p) => p.itemId));

    const itemsWithStatus = items.map((item) => ({
      id: item.id,
      key: item.key,
      name: item.name,
      description: item.description,
      type: item.type,
      price: item.price,
      icon: item.icon,
      config: item.config,
      owned: purchasedSet.has(item.id),
    }));

    res.json({ status: 'success', data: { items: itemsWithStatus } });
  } catch (err) {
    next(err);
  }
});

// Purchase item
shopRouter.post('/purchase', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { itemId } = req.body;

    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Item no encontrado' });
    }

    // Check if already owned
    const existingPurchase = await prisma.purchase.findUnique({
      where: { userId_itemId: { userId: req.user!.id, itemId: item.id } },
    });

    if (existingPurchase) {
      return res.status(400).json({ status: 'error', message: 'Ya tienes este item' });
    }

    // Check if user has enough coins
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { coins: true },
    });

    if (!user || user.coins < item.price) {
      return res.status(400).json({ status: 'error', message: 'No tienes suficientes coins' });
    }

    // Process purchase
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user!.id },
        data: { coins: { decrement: item.price } },
      }),
      prisma.purchase.create({
        data: {
          userId: req.user!.id,
          itemId: item.id,
          coins: item.price,
        },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        purchased: {
          itemId: item.id,
          name: item.name,
          type: item.type,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create Stripe checkout session (placeholder for Stripe integration)
shopRouter.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { packageId } = req.body;

    // Package pricing (coins you get for real money)
    const packages: Record<string, { coins: number; price: number }> = {
      small: { coins: 100, price: 0.99 },
      medium: { coins: 500, price: 4.99 },
      large: { coins: 1200, price: 9.99 },
    };

    const pkg = packages[packageId];
    if (!pkg) {
      return res.status(400).json({ status: 'error', message: 'Paquete no válido' });
    }

    // In production, this would create a Stripe Checkout session
    // For now, return a mock URL
    res.json({
      status: 'success',
      data: {
        checkoutUrl: `/shop/mock-checkout?package=${packageId}&coins=${pkg.coins}`,
        coins: pkg.coins,
        price: pkg.price,
      },
    });
  } catch (err) {
    next(err);
  }
});