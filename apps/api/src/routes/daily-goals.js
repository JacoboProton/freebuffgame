"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyGoalsRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
var error_js_1 = require("../middlewares/error.js");
exports.dailyGoalsRouter = (0, express_1.Router)();
// Get user's daily goals
exports.dailyGoalsRouter.get('/', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, todayStart, todayLessonsCompleted, todayGamesPlayed, isToday, dailyXPGoal, dailyXPProgress, dailyGoals, totalXP, completedGoals, earnedXP, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                userId = req.user.id;
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({
                        where: { id: userId },
                        select: {
                            xp: true,
                            currentStreak: true,
                            lastActiveAt: true,
                        },
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new error_js_1.AppError('Usuario no encontrado', 404);
                }
                todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.count({
                        where: {
                            userId: userId,
                            completed: true,
                            completedAt: {
                                gte: todayStart,
                            },
                        },
                    })];
            case 2:
                todayLessonsCompleted = _a.sent();
                return [4 /*yield*/, prisma_js_1.prisma.gameScore.count({
                        where: {
                            userId: userId,
                            completedAt: {
                                gte: todayStart,
                            },
                        },
                    })];
            case 3:
                todayGamesPlayed = _a.sent();
                isToday = new Date(user.lastActiveAt).toDateString() === todayStart.toDateString();
                dailyXPGoal = 50;
                dailyXPProgress = isToday ? Math.min(user.xp % 500, dailyXPGoal) : 0;
                dailyGoals = [
                    {
                        id: 'daily_xp',
                        type: 'xp',
                        title: 'Meta diaria de XP',
                        description: "Ganar ".concat(dailyXPGoal, " XP hoy"),
                        target: dailyXPGoal,
                        current: dailyXPProgress,
                        xpReward: 20,
                        completed: dailyXPProgress >= dailyXPGoal,
                    },
                    {
                        id: 'daily_lessons',
                        type: 'lessons',
                        title: 'Lecciones completadas',
                        description: 'Completar 3 lecciones hoy',
                        target: 3,
                        current: todayLessonsCompleted,
                        xpReward: 30,
                        completed: todayLessonsCompleted >= 3,
                    },
                    {
                        id: 'daily_streak',
                        type: 'streak',
                        title: 'Mantén tu racha',
                        description: 'Inicia sesión y aprende algo hoy',
                        target: 1,
                        current: user.currentStreak > 0 && isToday ? 1 : 0,
                        xpReward: 15,
                        completed: user.currentStreak > 0 && isToday,
                    },
                    {
                        id: 'daily_games',
                        type: 'games',
                        title: 'Juega un minijuego',
                        description: 'Completa al menos 1 minijuego',
                        target: 1,
                        current: todayGamesPlayed,
                        xpReward: 25,
                        completed: todayGamesPlayed >= 1,
                    },
                ];
                totalXP = dailyGoals.reduce(function (acc, goal) { return acc + goal.xpReward; }, 0);
                completedGoals = dailyGoals.filter(function (g) { return g.completed; }).length;
                earnedXP = dailyGoals.filter(function (g) { return g.completed; }).reduce(function (acc, g) { return acc + g.xpReward; }, 0);
                res.json({
                    status: 'success',
                    data: {
                        dailyGoals: dailyGoals,
                        summary: {
                            totalGoals: dailyGoals.length,
                            completedGoals: completedGoals,
                            totalXP: totalXP,
                            earnedXP: earnedXP,
                            allCompleted: completedGoals === dailyGoals.length,
                        },
                    },
                });
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                next(err_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Claim daily goal reward
exports.dailyGoalsRouter.post('/claim/:goalId', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var goalId, userId, validGoalIds, xpRewards, xpReward, user, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                goalId = req.params.goalId;
                userId = req.user.id;
                validGoalIds = ['daily_xp', 'daily_lessons', 'daily_streak', 'daily_games'];
                if (!validGoalIds.includes(goalId)) {
                    throw new error_js_1.AppError('Meta diaria no válida', 400);
                }
                xpRewards = {
                    daily_xp: 20,
                    daily_lessons: 30,
                    daily_streak: 15,
                    daily_games: 25,
                };
                xpReward = xpRewards[goalId];
                if (!xpReward) {
                    throw new error_js_1.AppError('Meta no encontrada', 404);
                }
                return [4 /*yield*/, prisma_js_1.prisma.user.update({
                        where: { id: userId },
                        data: {
                            xp: { increment: xpReward },
                            coins: { increment: Math.floor(xpReward / 5) },
                        },
                        select: {
                            xp: true,
                            coins: true,
                            level: true,
                        },
                    })];
            case 1:
                user = _a.sent();
                res.json({
                    status: 'success',
                    data: {
                        claimed: true,
                        goalId: goalId,
                        xpEarned: xpReward,
                        coinsEarned: Math.floor(xpReward / 5),
                        user: {
                            xp: user.xp,
                            coins: user.coins,
                            level: user.level,
                        },
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                next(err_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
