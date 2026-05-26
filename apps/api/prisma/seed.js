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
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, admin, demoPassword, demo, achievements, _i, achievements_1, achievement, games, _a, games_1, game, shopItems, _b, shopItems_1, item, aiCourse, module1, lesson1_1, lesson1_2, lesson1_3, module2, lesson2_1, finanzasCourse, finModule1, inglesCourse, engModule1, enrollment;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌱 Starting seed...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('admin123', 12)];
                case 1:
                    adminPassword = _c.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@duobijac.com' },
                            update: {},
                            create: {
                                email: 'admin@duobijac.com',
                                passwordHash: adminPassword,
                                name: 'Jac Admin',
                                role: 'admin',
                                xp: 5000,
                                level: 11,
                                coins: 500,
                                currentStreak: 15,
                                longestStreak: 30,
                            },
                        })];
                case 2:
                    admin = _c.sent();
                    console.log('✅ Admin user created');
                    return [4 /*yield*/, bcryptjs_1.default.hash('demo123', 12)];
                case 3:
                    demoPassword = _c.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'demo@duobijac.com' },
                            update: {},
                            create: {
                                email: 'demo@duobijac.com',
                                passwordHash: demoPassword,
                                name: 'Aprendiz Demo',
                                role: 'user',
                                xp: 750,
                                level: 2,
                                coins: 150,
                                currentStreak: 5,
                                longestStreak: 12,
                            },
                        })];
                case 4:
                    demo = _c.sent();
                    console.log('✅ Demo user created');
                    achievements = [
                        { key: 'first_lesson', title: 'Primera Lección', description: 'Completa tu primera lección', icon: '🎯', xpReward: 10 },
                        { key: 'first_xp', title: 'Primeros XP', description: 'Gana tus primeros 10 XP', icon: '⭐', xpReward: 5 },
                        { key: 'xp_100', title: 'Centauro', description: 'Alcanza 100 XP totales', icon: '💯', xpReward: 20 },
                        { key: 'xp_500', title: 'Guerrero', description: 'Alcanza 500 XP totales', icon: '⚔️', xpReward: 50 },
                        { key: 'xp_1000', title: 'Campeón', description: 'Alcanza 1000 XP totales', icon: '🏆', xpReward: 100 },
                        { key: 'streak_3', title: 'Tres en Raya', description: 'Mantén una racha de 3 días', icon: '🔥', xpReward: 15 },
                        { key: 'streak_7', title: 'Semana Perfecta', description: 'Mantén una racha de 7 días', icon: '🌟', xpReward: 50 },
                        { key: 'streak_30', title: 'Mes de Acero', description: 'Mantén una racha de 30 días', icon: '💪', xpReward: 200 },
                        { key: 'course_complete', title: 'Graduado', description: 'Completa tu primer curso', icon: '🎓', xpReward: 100 },
                        { key: 'perfect_score', title: 'Perfecto', description: 'Obtén 100% en una lección', icon: '💯', xpReward: 25 },
                    ];
                    _i = 0, achievements_1 = achievements;
                    _c.label = 5;
                case 5:
                    if (!(_i < achievements_1.length)) return [3 /*break*/, 8];
                    achievement = achievements_1[_i];
                    return [4 /*yield*/, prisma.achievement.upsert({
                            where: { key: achievement.key },
                            update: achievement,
                            create: achievement,
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('✅ Achievements created');
                    games = [
                        { key: 'speed_match', title: 'Speed Match', description: 'Combina conceptos antes de que se acabe el tiempo', icon: '🎮', xpReward: 30 },
                        { key: 'word_puzzle', title: 'Word Puzzle', description: 'Ordena las letras para formar palabras', icon: '🧩', xpReward: 25 },
                        { key: 'true_false_sprint', title: 'True/False Sprint', description: 'Responde verdadero o falso lo más rápido posible', icon: '⚡', xpReward: 20 },
                    ];
                    _a = 0, games_1 = games;
                    _c.label = 9;
                case 9:
                    if (!(_a < games_1.length)) return [3 /*break*/, 12];
                    game = games_1[_a];
                    return [4 /*yield*/, prisma.game.upsert({
                            where: { key: game.key },
                            update: game,
                            create: game,
                        })];
                case 10:
                    _c.sent();
                    _c.label = 11;
                case 11:
                    _a++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log('✅ Games created');
                    shopItems = [
                        { key: 'avatar_cool', name: 'Avatar Cool', description: 'Un avatar genial para tu perfil', type: 'avatar', price: 100, icon: '😎' },
                        { key: 'avatar_ninja', name: 'Avatar Ninja', description: 'Un ninja misterioso', type: 'avatar', price: 150, icon: '🥷' },
                        { key: 'avatar_astronaut', name: 'Avatar Astronauta', description: 'Un astronauta espacial', type: 'avatar', price: 200, icon: '🚀' },
                        { key: 'streak_freeze', name: 'Freeze de Racha', description: 'Protege tu racha por un día', type: 'streak_freeze', price: 50, icon: '🧊' },
                        { key: 'badge_vip', name: 'Badge VIP', description: 'Un badge exclusivo para usuarios VIP', type: 'badge', price: 300, icon: '👑' },
                    ];
                    _b = 0, shopItems_1 = shopItems;
                    _c.label = 13;
                case 13:
                    if (!(_b < shopItems_1.length)) return [3 /*break*/, 16];
                    item = shopItems_1[_b];
                    return [4 /*yield*/, prisma.shopItem.upsert({
                            where: { key: item.key },
                            update: item,
                            create: item,
                        })];
                case 14:
                    _c.sent();
                    _c.label = 15;
                case 15:
                    _b++;
                    return [3 /*break*/, 13];
                case 16:
                    console.log('✅ Shop items created');
                    return [4 /*yield*/, prisma.course.upsert({
                            where: { id: 'course-ai-fundamentals' },
                            update: {},
                            create: {
                                id: 'course-ai-fundamentals',
                                title: 'Fundamentos de Inteligencia Artificial',
                                description: 'Aprende los conceptos básicos de la IA, machine learning y redes neuronales. Ideal para principiantes curious about AI.',
                                category: 'IA & Tech',
                                difficulty: 'beginner',
                                estimatedHours: 8,
                                isPublished: true,
                            },
                        })];
                case 17:
                    aiCourse = _c.sent();
                    return [4 /*yield*/, prisma.module.upsert({
                            where: { id: 'ai-module-1' },
                            update: {},
                            create: {
                                id: 'ai-module-1',
                                courseId: aiCourse.id,
                                title: '¿Qué es la Inteligencia Artificial?',
                                order: 1,
                            },
                        })];
                case 18:
                    module1 = _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'ai-lesson-1-1' },
                            update: {},
                            create: {
                                id: 'ai-lesson-1-1',
                                moduleId: module1.id,
                                title: 'Introducción a la IA',
                                type: 'multiple_choice',
                                content: {
                                    question: '¿Qué es la Inteligencia Artificial?',
                                    options: [
                                        'Un tipo de robot avanzado',
                                        'Sistemas que pueden aprender y tomar decisiones',
                                        'Solo relacionado con computadoras',
                                        'Un lenguaje de programación',
                                    ],
                                    correctIndex: 1,
                                },
                                xpReward: 20,
                                order: 1,
                            },
                        })];
                case 19:
                    lesson1_1 = _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'ai-lesson-1-2' },
                            update: {},
                            create: {
                                id: 'ai-lesson-1-2',
                                moduleId: module1.id,
                                title: 'Tipos de IA',
                                type: 'fill_blank',
                                content: {
                                    sentence: 'La IA que puede aprender de datos se llama ___ learning.',
                                    correctAnswer: 'machine',
                                    hint: 'Es una palabra de dos partes',
                                },
                                xpReward: 25,
                                order: 2,
                            },
                        })];
                case 20:
                    lesson1_2 = _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'ai-lesson-1-3' },
                            update: {},
                            create: {
                                id: 'ai-lesson-1-3',
                                moduleId: module1.id,
                                title: 'IA en nuestra vida diaria',
                                type: 'true_false',
                                content: {
                                    statement: 'Los asistentes de voz como Siri son ejemplos de IA.',
                                    correctAnswer: true,
                                },
                                xpReward: 15,
                                order: 3,
                            },
                        })];
                case 21:
                    lesson1_3 = _c.sent();
                    return [4 /*yield*/, prisma.module.upsert({
                            where: { id: 'ai-module-2' },
                            update: {},
                            create: {
                                id: 'ai-module-2',
                                courseId: aiCourse.id,
                                title: 'Machine Learning',
                                order: 2,
                            },
                        })];
                case 22:
                    module2 = _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'ai-lesson-2-1' },
                            update: {},
                            create: {
                                id: 'ai-lesson-2-1',
                                moduleId: module2.id,
                                title: '¿Qué es Machine Learning?',
                                type: 'multiple_choice',
                                content: {
                                    question: '¿Cuál es la principal característica del Machine Learning?',
                                    options: [
                                        'No necesita datos',
                                        'Aprende automáticamente de los datos',
                                        'Siempre da respuestas perfectas',
                                        'Solo funciona en computadoras potentes',
                                    ],
                                    correctIndex: 1,
                                },
                                xpReward: 20,
                                order: 1,
                            },
                        })];
                case 23:
                    lesson2_1 = _c.sent();
                    console.log('✅ AI Course created with modules and lessons');
                    return [4 /*yield*/, prisma.course.upsert({
                            where: { id: 'course-finanzas' },
                            update: {},
                            create: {
                                id: 'course-finanzas',
                                title: 'Finanzas Personales para Principiantes',
                                description: 'Aprende a gestionar tu dinero, crear presupuestos y hacer inversiones inteligentes desde cero.',
                                category: 'Finanzas',
                                difficulty: 'beginner',
                                estimatedHours: 6,
                                isPublished: true,
                            },
                        })];
                case 24:
                    finanzasCourse = _c.sent();
                    return [4 /*yield*/, prisma.module.upsert({
                            where: { id: 'fin-module-1' },
                            update: {},
                            create: {
                                id: 'fin-module-1',
                                courseId: finanzasCourse.id,
                                title: 'Presupuesto Básico',
                                order: 1,
                            },
                        })];
                case 25:
                    finModule1 = _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'fin-lesson-1-1' },
                            update: {},
                            create: {
                                id: 'fin-lesson-1-1',
                                moduleId: finModule1.id,
                                title: '¿Qué es un presupuesto?',
                                type: 'multiple_choice',
                                content: {
                                    question: '¿Para qué sirve un presupuesto?',
                                    options: [
                                        'Para gastar todo tu dinero',
                                        'Para saber cuánto dinero tienes y en qué gastarlo',
                                        'Solo para empresas',
                                        'Para pedir préstamos',
                                    ],
                                    correctIndex: 1,
                                },
                                xpReward: 20,
                                order: 1,
                            },
                        })];
                case 26:
                    _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'fin-lesson-1-2' },
                            update: {},
                            create: {
                                id: 'fin-lesson-1-2',
                                moduleId: finModule1.id,
                                title: 'Gastos fijos vs variables',
                                type: 'matching',
                                content: {
                                    pairs: [
                                        { left: 'Renta', right: 'Gasto fijo' },
                                        { left: 'Comida', right: 'Gasto variable' },
                                        { left: 'Internet', right: 'Gasto fijo' },
                                        { left: 'Entretenimiento', right: 'Gasto variable' },
                                    ],
                                },
                                xpReward: 30,
                                order: 2,
                            },
                        })];
                case 27:
                    _c.sent();
                    console.log('✅ Finanzas Course created');
                    return [4 /*yield*/, prisma.course.upsert({
                            where: { id: 'course-ingles' },
                            update: {},
                            create: {
                                id: 'course-ingles',
                                title: 'Inglés para Principiantes',
                                description: 'Domina las bases del inglés con lecciones interactivas, vocabulario esencial y pronunciación práctica.',
                                category: 'Idiomas',
                                difficulty: 'beginner',
                                estimatedHours: 12,
                                isPublished: true,
                            },
                        })];
                case 28:
                    inglesCourse = _c.sent();
                    return [4 /*yield*/, prisma.module.upsert({
                            where: { id: 'eng-module-1' },
                            update: {},
                            create: {
                                id: 'eng-module-1',
                                courseId: inglesCourse.id,
                                title: 'Saludos y Presentaciones',
                                order: 1,
                            },
                        })];
                case 29:
                    engModule1 = _c.sent();
                    return [4 /*yield*/, prisma.lesson.upsert({
                            where: { id: 'eng-lesson-1-1' },
                            update: {},
                            create: {
                                id: 'eng-lesson-1-1',
                                moduleId: engModule1.id,
                                title: 'Saludos básicos',
                                type: 'multiple_choice',
                                content: {
                                    question: '¿Cómo se dice \"Hola, ¿cómo estás?\" en inglés?',
                                    options: [
                                        'Hello, how are you?',
                                        'Goodbye, see you',
                                        'Thank you very much',
                                        'Yes, I understand',
                                    ],
                                    correctIndex: 0,
                                },
                                xpReward: 15,
                                order: 1,
                            },
                        })];
                case 30:
                    _c.sent();
                    console.log('✅ Inglés Course created');
                    return [4 /*yield*/, prisma.enrollment.upsert({
                            where: { userId_courseId: { userId: demo.id, courseId: aiCourse.id } },
                            update: {},
                            create: {
                                userId: demo.id,
                                courseId: aiCourse.id,
                            },
                        })];
                case 31:
                    enrollment = _c.sent();
                    return [4 /*yield*/, prisma.lessonProgress.upsert({
                            where: { userId_lessonId: { userId: demo.id, lessonId: lesson1_1.id } },
                            update: {},
                            create: {
                                userId: demo.id,
                                lessonId: lesson1_1.id,
                                completed: true,
                                score: 100,
                                xpEarned: 20,
                                timeSpent: 120,
                                attempts: 1,
                                completedAt: new Date(),
                            },
                        })];
                case 32:
                    _c.sent();
                    return [4 /*yield*/, prisma.lessonProgress.upsert({
                            where: { userId_lessonId: { userId: demo.id, lessonId: lesson1_2.id } },
                            update: {},
                            create: {
                                userId: demo.id,
                                lessonId: lesson1_2.id,
                                completed: true,
                                score: 80,
                                xpEarned: 20,
                                timeSpent: 180,
                                attempts: 2,
                                completedAt: new Date(),
                            },
                        })];
                case 33:
                    _c.sent();
                    console.log('✅ Demo enrollment and progress created');
                    console.log('🎉 Seed completed successfully!');
                    console.log('\n📝 Test accounts:');
                    console.log('   Admin: admin@duobijac.com / admin123');
                    console.log('   Demo: demo@duobijac.com / demo123');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
