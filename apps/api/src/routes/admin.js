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
exports.adminRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
var error_js_1 = require("../middlewares/error.js");
exports.adminRouter = (0, express_1.Router)();
// All admin routes require authentication and admin role
exports.adminRouter.use(auth_js_1.authenticate, auth_js_1.requireAdmin);
// Get dashboard stats
exports.adminRouter.get('/stats', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalUsers, totalCourses, totalEnrollments, totalCompletions, recentUsers, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Promise.all([
                        prisma_js_1.prisma.user.count({ where: { role: 'user' } }),
                        prisma_js_1.prisma.course.count(),
                        prisma_js_1.prisma.enrollment.count(),
                        prisma_js_1.prisma.enrollment.count({ where: { completed: true } }),
                        prisma_js_1.prisma.user.findMany({
                            where: { role: 'user' },
                            select: { id: true, name: true, email: true, createdAt: true },
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                        }),
                    ])];
            case 1:
                _a = _b.sent(), totalUsers = _a[0], totalCourses = _a[1], totalEnrollments = _a[2], totalCompletions = _a[3], recentUsers = _a[4];
                res.json({
                    status: 'success',
                    data: {
                        stats: {
                            totalUsers: totalUsers,
                            totalCourses: totalCourses,
                            totalEnrollments: totalEnrollments,
                            totalCompletions: totalCompletions,
                            completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
                        },
                        recentUsers: recentUsers,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                next(err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// CRUD for courses
exports.adminRouter.post('/courses', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, category, difficulty, estimatedHours, imageUrl, course, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, description = _a.description, category = _a.category, difficulty = _a.difficulty, estimatedHours = _a.estimatedHours, imageUrl = _a.imageUrl;
                return [4 /*yield*/, prisma_js_1.prisma.course.create({
                        data: {
                            title: title,
                            description: description,
                            category: category,
                            difficulty: difficulty || 'beginner',
                            estimatedHours: estimatedHours || 1,
                            imageUrl: imageUrl,
                            isPublished: false,
                        },
                    })];
            case 1:
                course = _b.sent();
                res.status(201).json({ status: 'success', data: { course: course } });
                return [3 /*break*/, 3];
            case 2:
                err_2 = _b.sent();
                next(err_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.get('/courses', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var courses, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_js_1.prisma.course.findMany({
                        include: {
                            modules: {
                                include: {
                                    _count: { select: { lessons: true } },
                                },
                            },
                            _count: { select: { enrollments: true } },
                        },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                courses = _a.sent();
                res.json({ status: 'success', data: { courses: courses } });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                next(err_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.get('/courses/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var course, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_js_1.prisma.course.findUnique({
                        where: { id: req.params.id },
                        include: {
                            modules: {
                                orderBy: { order: 'asc' },
                                include: {
                                    lessons: {
                                        orderBy: { order: 'asc' },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                course = _a.sent();
                if (!course) {
                    throw new error_js_1.AppError('Curso no encontrado', 404);
                }
                res.json({ status: 'success', data: { course: course } });
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                next(err_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.patch('/courses/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, category, difficulty, estimatedHours, imageUrl, isPublished, course, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, description = _a.description, category = _a.category, difficulty = _a.difficulty, estimatedHours = _a.estimatedHours, imageUrl = _a.imageUrl, isPublished = _a.isPublished;
                return [4 /*yield*/, prisma_js_1.prisma.course.update({
                        where: { id: req.params.id },
                        data: {
                            title: title,
                            description: description,
                            category: category,
                            difficulty: difficulty,
                            estimatedHours: estimatedHours,
                            imageUrl: imageUrl,
                            isPublished: isPublished,
                        },
                    })];
            case 1:
                course = _b.sent();
                res.json({ status: 'success', data: { course: course } });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _b.sent();
                next(err_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.delete('/courses/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_js_1.prisma.course.delete({
                        where: { id: req.params.id },
                    })];
            case 1:
                _a.sent();
                res.json({ status: 'success', message: 'Curso eliminado' });
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                next(err_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// CRUD for modules
exports.adminRouter.post('/courses/:courseId/modules', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, order, module_1, err_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, order = _a.order;
                return [4 /*yield*/, prisma_js_1.prisma.module.create({
                        data: {
                            courseId: req.params.courseId,
                            title: title,
                            order: order || 0,
                        },
                    })];
            case 1:
                module_1 = _b.sent();
                res.status(201).json({ status: 'success', data: { module: module_1 } });
                return [3 /*break*/, 3];
            case 2:
                err_7 = _b.sent();
                next(err_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.patch('/modules/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, order, module_2, err_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, order = _a.order;
                return [4 /*yield*/, prisma_js_1.prisma.module.update({
                        where: { id: req.params.id },
                        data: { title: title, order: order },
                    })];
            case 1:
                module_2 = _b.sent();
                res.json({ status: 'success', data: { module: module_2 } });
                return [3 /*break*/, 3];
            case 2:
                err_8 = _b.sent();
                next(err_8);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.delete('/modules/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_js_1.prisma.module.delete({
                        where: { id: req.params.id },
                    })];
            case 1:
                _a.sent();
                res.json({ status: 'success', message: 'Módulo eliminado' });
                return [3 /*break*/, 3];
            case 2:
                err_9 = _a.sent();
                next(err_9);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// CRUD for lessons
exports.adminRouter.post('/modules/:moduleId/lessons', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, type, content, xpReward, order, lesson, err_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, type = _a.type, content = _a.content, xpReward = _a.xpReward, order = _a.order;
                return [4 /*yield*/, prisma_js_1.prisma.lesson.create({
                        data: {
                            moduleId: req.params.moduleId,
                            title: title,
                            type: type,
                            content: content,
                            xpReward: xpReward || 20,
                            order: order || 0,
                        },
                    })];
            case 1:
                lesson = _b.sent();
                res.status(201).json({ status: 'success', data: { lesson: lesson } });
                return [3 /*break*/, 3];
            case 2:
                err_10 = _b.sent();
                next(err_10);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.patch('/lessons/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, type, content, xpReward, order, lesson, err_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, type = _a.type, content = _a.content, xpReward = _a.xpReward, order = _a.order;
                return [4 /*yield*/, prisma_js_1.prisma.lesson.update({
                        where: { id: req.params.id },
                        data: { title: title, type: type, content: content, xpReward: xpReward, order: order },
                    })];
            case 1:
                lesson = _b.sent();
                res.json({ status: 'success', data: { lesson: lesson } });
                return [3 /*break*/, 3];
            case 2:
                err_11 = _b.sent();
                next(err_11);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.adminRouter.delete('/lessons/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_js_1.prisma.lesson.delete({
                        where: { id: req.params.id },
                    })];
            case 1:
                _a.sent();
                res.json({ status: 'success', message: 'Lección eliminada' });
                return [3 /*break*/, 3];
            case 2:
                err_12 = _a.sent();
                next(err_12);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// User management
exports.adminRouter.get('/users', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, search, where, _d, users, total, err_13;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, search = _a.search;
                where = { role: 'user' };
                if (search) {
                    where.OR = [
                        { name: { contains: String(search), mode: 'insensitive' } },
                        { email: { contains: String(search), mode: 'insensitive' } },
                    ];
                }
                return [4 /*yield*/, Promise.all([
                        prisma_js_1.prisma.user.findMany({
                            where: where,
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                xp: true,
                                level: true,
                                currentStreak: true,
                                createdAt: true,
                                _count: { select: { enrollments: true, achievements: true } },
                            },
                            orderBy: { createdAt: 'desc' },
                            skip: (Number(page) - 1) * Number(limit),
                            take: Number(limit),
                        }),
                        prisma_js_1.prisma.user.count({ where: where }),
                    ])];
            case 1:
                _d = _e.sent(), users = _d[0], total = _d[1];
                res.json({
                    status: 'success',
                    data: {
                        users: users,
                        pagination: {
                            page: Number(page),
                            limit: Number(limit),
                            total: total,
                            pages: Math.ceil(total / Number(limit)),
                        },
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                err_13 = _e.sent();
                next(err_13);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
