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
exports.coursesRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
var error_js_1 = require("../middlewares/error.js");
exports.coursesRouter = (0, express_1.Router)();
// Get all published courses
exports.coursesRouter.get('/', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, category, difficulty, search, where, courses, coursesWithStats, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, category = _a.category, difficulty = _a.difficulty, search = _a.search;
                where = { isPublished: true };
                if (category)
                    where.category = category;
                if (difficulty)
                    where.difficulty = difficulty;
                if (search) {
                    where.OR = [
                        { title: { contains: String(search), mode: 'insensitive' } },
                        { description: { contains: String(search), mode: 'insensitive' } },
                    ];
                }
                return [4 /*yield*/, prisma_js_1.prisma.course.findMany({
                        where: where,
                        include: {
                            modules: {
                                include: {
                                    lessons: {
                                        select: { id: true },
                                    },
                                },
                            },
                            _count: {
                                select: { enrollments: true },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                courses = _b.sent();
                coursesWithStats = courses.map(function (course) { return ({
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    category: course.category,
                    imageUrl: course.imageUrl,
                    difficulty: course.difficulty,
                    estimatedHours: course.estimatedHours,
                    modulesCount: course.modules.length,
                    lessonsCount: course.modules.reduce(function (acc, m) { return acc + m.lessons.length; }, 0),
                    studentsCount: course._count.enrollments,
                }); });
                res.json({ status: 'success', data: { courses: coursesWithStats } });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                next(err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get course by ID with modules and lessons
exports.coursesRouter.get('/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var course, err_2;
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
                                        select: {
                                            id: true,
                                            title: true,
                                            type: true,
                                            xpReward: true,
                                            order: true,
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                course = _a.sent();
                if (!course || !course.isPublished) {
                    throw new error_js_1.AppError('Curso no encontrado', 404);
                }
                res.json({ status: 'success', data: { course: course } });
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                next(err_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Enroll in a course
exports.coursesRouter.post('/:id/enroll', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var course, existing, enrollment, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, prisma_js_1.prisma.course.findUnique({
                        where: { id: req.params.id },
                        select: { id: true },
                    })];
            case 1:
                course = _a.sent();
                if (!course) {
                    throw new error_js_1.AppError('Curso no encontrado', 404);
                }
                return [4 /*yield*/, prisma_js_1.prisma.enrollment.findUnique({
                        where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
                    })];
            case 2:
                existing = _a.sent();
                if (existing) {
                    throw new error_js_1.AppError('Ya estás enrolled en este curso', 400);
                }
                return [4 /*yield*/, prisma_js_1.prisma.enrollment.create({
                        data: { userId: req.user.id, courseId: course.id },
                    })];
            case 3:
                enrollment = _a.sent();
                // Give some starting coins
                return [4 /*yield*/, prisma_js_1.prisma.user.update({
                        where: { id: req.user.id },
                        data: { coins: { increment: 10 } },
                    })];
            case 4:
                // Give some starting coins
                _a.sent();
                res.status(201).json({ status: 'success', data: { enrollment: enrollment } });
                return [3 /*break*/, 6];
            case 5:
                err_3 = _a.sent();
                next(err_3);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Get user's enrolled courses
exports.coursesRouter.get('/user/enrollments', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var enrollments, enrollmentsWithProgress, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma_js_1.prisma.enrollment.findMany({
                        where: { userId: req.user.id },
                        include: {
                            course: {
                                include: {
                                    modules: {
                                        include: {
                                            lessons: {
                                                select: { id: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: { startedAt: 'desc' },
                    })];
            case 1:
                enrollments = _a.sent();
                return [4 /*yield*/, Promise.all(enrollments.map(function (enrollment) { return __awaiter(void 0, void 0, void 0, function () {
                        var totalLessons, completedProgress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    totalLessons = enrollment.course.modules.reduce(function (acc, m) { return acc + m.lessons.length; }, 0);
                                    return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.count({
                                            where: {
                                                userId: req.user.id,
                                                lessonId: { in: enrollment.course.modules.flatMap(function (m) { return m.lessons.map(function (l) { return l.id; }); }) },
                                                completed: true,
                                            },
                                        })];
                                case 1:
                                    completedProgress = _a.sent();
                                    return [2 /*return*/, {
                                            id: enrollment.id,
                                            courseId: enrollment.course.id,
                                            title: enrollment.course.title,
                                            description: enrollment.course.description,
                                            category: enrollment.course.category,
                                            imageUrl: enrollment.course.imageUrl,
                                            difficulty: enrollment.course.difficulty,
                                            startedAt: enrollment.startedAt,
                                            completed: enrollment.completed,
                                            progress: totalLessons > 0 ? Math.round((completedProgress / totalLessons) * 100) : 0,
                                            completedLessons: completedProgress,
                                            totalLessons: totalLessons,
                                        }];
                            }
                        });
                    }); }))];
            case 2:
                enrollmentsWithProgress = _a.sent();
                res.json({ status: 'success', data: { enrollments: enrollmentsWithProgress } });
                return [3 /*break*/, 4];
            case 3:
                err_4 = _a.sent();
                next(err_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
