"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var passport_1 = require("passport");
var auth_js_1 = require("./routes/auth.js");
var courses_js_1 = require("./routes/courses.js");
var lessons_js_1 = require("./routes/lessons.js");
var user_js_1 = require("./routes/user.js");
var leaderboard_js_1 = require("./routes/leaderboard.js");
var achievements_js_1 = require("./routes/achievements.js");
var games_js_1 = require("./routes/games.js");
var shop_js_1 = require("./routes/shop.js");
var admin_js_1 = require("./routes/admin.js");
var daily_goals_js_1 = require("./routes/daily-goals.js");
var error_js_1 = require("./middlewares/error.js");
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json());
// Initialize Passport
app.use(passport_1.default.initialize());
// Health check
app.get('/health', function (_, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_js_1.authRouter);
app.use('/api/courses', courses_js_1.coursesRouter);
app.use('/api/lessons', lessons_js_1.lessonsRouter);
app.use('/api/user', user_js_1.userRouter);
app.use('/api/leaderboard', leaderboard_js_1.leaderboardRouter);
app.use('/api/achievements', achievements_js_1.achievementsRouter);
app.use('/api/games', games_js_1.gamesRouter);
app.use('/api/shop', shop_js_1.shopRouter);
app.use('/api/admin', admin_js_1.adminRouter);
app.use('/api/daily-goals', daily_goals_js_1.dailyGoalsRouter);
// Error handler
app.use(error_js_1.errorHandler);
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 API server running on http://localhost:".concat(PORT));
});
exports.default = app;
