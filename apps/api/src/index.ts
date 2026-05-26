import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { authRouter } from './routes/auth.js';
import { coursesRouter } from './routes/courses.js';
import { lessonsRouter } from './routes/lessons.js';
import { userRouter } from './routes/user.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { achievementsRouter } from './routes/achievements.js';
import { gamesRouter } from './routes/games.js';
import { shopRouter } from './routes/shop.js';
import { adminRouter } from './routes/admin.js';
import { dailyGoalsRouter } from './routes/daily-goals.js';
import { errorHandler } from './middlewares/error.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/user', userRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/shop', shopRouter);
app.use('/api/admin', adminRouter);
app.use('/api/daily-goals', dailyGoalsRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

export default app;