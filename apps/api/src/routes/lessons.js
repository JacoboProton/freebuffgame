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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonsRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
var shared_1 = require("@duobijac/shared");
var error_js_1 = require("../middlewares/error.js");
exports.lessonsRouter = (0, express_1.Router)();
// Get lesson content
exports.lessonsRouter.get('/:id', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var lesson, enrollment, progress, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, prisma_js_1.prisma.lesson.findUnique({
                        where: { id: req.params.id },
                        include: {
                            module: {
                                include: {
                                    course: {
                                        select: { id: true, title: true },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                lesson = _a.sent();
                if (!lesson) {
                    throw new error_js_1.AppError('Lección no encontrada', 404);
                }
                return [4 /*yield*/, prisma_js_1.prisma.enrollment.findUnique({
                        where: {
                            userId_courseId: {
                                userId: req.user.id,
                                courseId: lesson.module.course.id,
                            },
                        },
                    })];
            case 2:
                enrollment = _a.sent();
                if (!enrollment) {
                    throw new error_js_1.AppError('No estás enrolled en este curso', 403);
                }
                return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.findUnique({
                        where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
                    })];
            case 3:
                progress = _a.sent();
                res.json({
                    status: 'success',
                    data: {
                        lesson: {
                            id: lesson.id,
                            title: lesson.title,
                            type: lesson.type,
                            content: lesson.content,
                            xpReward: lesson.xpReward,
                            order: lesson.order,
                            moduleTitle: lesson.module.title,
                            courseId: lesson.module.course.id,
                            courseTitle: lesson.module.course.title,
                        },
                        progress: progress ? {
                            completed: progress.completed,
                            score: progress.score,
                            xpEarned: progress.xpEarned,
                            attempts: progress.attempts,
                        } : null,
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
// Submit lesson progress
exports.lessonsRouter.post('/:id/progress', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var data, lesson, existingProgress, isCorrect, xpEarned, completed, progress, _a, user, oldLevel, newLevel, leveledUp, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 11, , 12]);
                data = shared_1.SubmitProgressSchema.parse(req.body);
                return [4 /*yield*/, prisma_js_1.prisma.lesson.findUnique({
                        where: { id: req.params.id },
                        include: {
                            module: { select: { courseId: true } },
                        },
                    })];
            case 1:
                lesson = _b.sent();
                if (!lesson) {
                    throw new error_js_1.AppError('Lección no encontrada', 404);
                }
                return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.findUnique({
                        where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
                    })];
            case 2:
                existingProgress = _b.sent();
                isCorrect = data.score >= 70;
                xpEarned = isCorrect ? lesson.xpReward : Math.floor(lesson.xpReward * 0.5);
                completed = isCorrect;
                if (!existingProgress) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.update({
                        where: { id: existingProgress.id },
                        data: {
                            score: Math.max(existingProgress.score, data.score),
                            attempts: { increment: 1 },
                            completed: existingProgress.completed || completed,
                            xpEarned: Math.max(existingProgress.xpEarned, xpEarned),
                            timeSpent: { increment: data.timeSpent },
                            completedAt: completed && !existingProgress.completed ? new Date() : existingProgress.completedAt,
                        },
                    })];
            case 3:
                _a = _b.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.create({
                    data: {
                        userId: req.user.id,
                        lessonId: lesson.id,
                        score: data.score,
                        xpEarned: xpEarned,
                        timeSpent: data.timeSpent,
                        attempts: 1,
                        completed: completed,
                        completedAt: completed ? new Date() : null,
                    },
                })];
            case 5:
                _a = _b.sent();
                _b.label = 6;
            case 6:
                progress = _a;
                if (!(completed && (!existingProgress || !existingProgress.completed))) return [3 /*break*/, 9];
                return [4 /*yield*/, prisma_js_1.prisma.user.update({
                        where: { id: req.user.id },
                        data: {
                            xp: { increment: xpEarned },
                            coins: { increment: Math.floor(xpEarned / 10) },
                        },
                    })];
            case 7:
                user = _b.sent();
                oldLevel = Math.floor((user.xp - xpEarned) / 500) + 1;
                newLevel = Math.floor(user.xp / 500) + 1;
                leveledUp = newLevel > oldLevel;
                // Check achievements
                return [4 /*yield*/, checkAchievements(req.user.id)];
            case 8:
                // Check achievements
                _b.sent();
                res.json({
                    status: 'success',
                    data: {
                        progress: {
                            completed: progress.completed,
                            score: progress.score,
                            xpEarned: progress.xpEarned,
                        },
                        user: {
                            xp: user.xp,
                            coins: user.coins,
                            level: user.level,
                        },
                        leveledUp: leveledUp,
                        newLevel: leveledUp ? newLevel : undefined,
                    },
                });
                return [3 /*break*/, 10];
            case 9:
                res.json({
                    status: 'success',
                    data: {
                        progress: {
                            completed: progress.completed,
                            score: progress.score,
                            xpEarned: progress.xpEarned,
                        },
                    },
                });
                _b.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                err_2 = _b.sent();
                next(err_2);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); });
// Helper function to check achievements
function checkAchievements(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, unlockedKeys, xpAchievements, streakAchievements, achievementsToCheck, _i, achievementsToCheck_1, achievement, dbAchievement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({
                        where: { id: userId },
                        include: { achievements: true },
                    })];
                case 1:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/];
                    unlockedKeys = new Set(user.achievements.map(function (a) { return a.achievement.key; }));
                    xpAchievements = [
                        { key: 'first_xp', requirement: user.xp >= 10 },
                        { key: 'xp_100', requirement: user.xp >= 100 },
                        { key: 'xp_500', requirement: user.xp >= 500 },
                        { key: 'xp_1000', requirement: user.xp >= 1000 },
                    ];
                    streakAchievements = [
                        { key: 'streak_3', requirement: user.currentStreak >= 3 },
                        { key: 'streak_7', requirement: user.currentStreak >= 7 },
                        { key: 'streak_30', requirement: user.currentStreak >= 30 },
                    ];
                    achievementsToCheck = __spreadArray(__spreadArray([], xpAchievements, true), streakAchievements, true);
                    _i = 0, achievementsToCheck_1 = achievementsToCheck;
                    _a.label = 2;
                case 2:
                    if (!(_i < achievementsToCheck_1.length)) return [3 /*break*/, 7];
                    achievement = achievementsToCheck_1[_i];
                    if (!(!unlockedKeys.has(achievement.key) && achievement.requirement)) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma_js_1.prisma.achievement.findUnique({
                            where: { key: achievement.key },
                        })];
                case 3:
                    dbAchievement = _a.sent();
                    if (!dbAchievement) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma_js_1.prisma.userAchievement.create({
                            data: {
                                userId: userId,
                                achievementId: dbAchievement.id,
                            },
                        })];
                case 4:
                    _a.sent();
                    // Give XP reward
                    return [4 /*yield*/, prisma_js_1.prisma.user.update({
                            where: { id: userId },
                            data: { xp: { increment: dbAchievement.xpReward } },
                        })];
                case 5:
                    // Give XP reward
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/];
            }
        });
    });
}
