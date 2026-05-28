import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import crypto from 'crypto';

export const referralsRouter = Router();

// Generate referral code for current user
referralsRouter.post('/code', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Check if user already has a code
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (existingUser?.referralCode) {
      return res.json({
        status: 'success',
        data: { referralCode: existingUser.referralCode }
      });
    }

    // Generate unique code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code }
    });

    res.json({ status: 'success', data: { referralCode: code } });
  } catch (err) {
    next(err);
  }
});

// Get referral stats
referralsRouter.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, totalReferrals: true, referralCredits: true }
    });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: { select: { id: true, name: true, avatar: true, createdAt: true } }
      },
      orderBy: { referredAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: {
        referralCode: user?.referralCode,
        totalReferrals: user?.totalReferrals || 0,
        referralCredits: user?.referralCredits || 0,
        referrals
      }
    });
  } catch (err) {
    next(err);
  }
});

// Apply referral code
referralsRouter.post('/apply', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ status: 'error', message: 'Referral code required' });
    }

    // Check if user already used a referral
    const existingReferral = await prisma.referral.findFirst({
      where: { refereeId: userId }
    });

    if (existingReferral) {
      return res.status(400).json({ status: 'error', message: 'Already used a referral code' });
    }

    // Find referrer by code
    const referrer = await prisma.user.findFirst({
      where: { referralCode: code }
    });

    if (!referrer) {
      return res.status(404).json({ status: 'error', message: 'Invalid referral code' });
    }

    // Can't refer yourself
    if (referrer.id === userId) {
      return res.status(400).json({ status: 'error', message: 'Cannot use your own referral code' });
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId: userId,
        code,
        status: 'pending',
        rewardType: 'xp',
        rewardValue: 50 // 50 XP for successful referral
      }
    });

    // Update referrer stats
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        totalReferrals: { increment: 1 },
        referralCredits: { increment: 50 }
      }
    });

    // Give XP to referee for signing up
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: 25 }, // 25 XP for using referral code
        referredBy: referrer.id
      }
    });

    res.json({
      status: 'success',
      data: {
        message: 'Referral code applied! You earned 25 XP.',
        referrerName: referrer.name
      }
    });
  } catch (err) {
    next(err);
  }
});

// Claim referral reward (when referee completes first course)
referralsRouter.post('/claim/:referralId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { referralId } = req.params;
    const userId = req.user!.id;

    const referral = await prisma.referral.findUnique({
      where: { id: referralId }
    });

    if (!referral) {
      return res.status(404).json({ status: 'error', message: 'Referral not found' });
    }

    if (referral.referrerId !== userId) {
      return res.status(403).json({ status: 'error', message: 'Not your referral' });
    }

    if (referral.status === 'rewarded') {
      return res.status(400).json({ status: 'error', message: 'Already claimed' });
    }

    if (referral.status !== 'completed') {
      return res.status(400).json({ status: 'error', message: 'Referral not completed yet' });
    }

    // Mark as rewarded
    await prisma.referral.update({
      where: { id: referralId },
      data: { status: 'rewarded', completedAt: new Date() }
    });

    res.json({
      status: 'success',
      data: {
        message: `Reward claimed! You earned ${referral.rewardValue || 50} XP.`
      }
    });
  } catch (err) {
    next(err);
  }
});