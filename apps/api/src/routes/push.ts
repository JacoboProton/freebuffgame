import { Router } from 'express';

const router = Router();

// Placeholder - actual push handling is in notifications.ts
router.get('/status', (_, res) => {
  res.json({ status: 'success', data: { enabled: true } });
});

export default router;