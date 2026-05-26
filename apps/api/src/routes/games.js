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
exports.gamesRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
exports.gamesRouter = (0, express_1.Router)();
// Get all available games
exports.gamesRouter.get('/', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var games, userScores, scoreMap_1, gamesWithScores, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma_js_1.prisma.game.findMany({
                        orderBy: { title: 'asc' },
                    })];
            case 1:
                games = _a.sent();
                return [4 /*yield*/, prisma_js_1.prisma.gameScore.findMany({
                        where: { userId: req.user.id },
                        select: { gameId: true, score: true },
                    })];
            case 2:
                userScores = _a.sent();
                scoreMap_1 = new Map(userScores.map(function (s) { return [s.gameId, s.score]; }));
                gamesWithScores = games.map(function (game) { return ({
                    id: game.id,
                    key: game.key,
                    title: game.title,
                    description: game.description,
                    icon: game.icon,
                    xpReward: game.xpReward,
                    config: game.config,
                    bestScore: scoreMap_1.get(game.id) || null,
                }); });
                res.json({ status: 'success', data: { games: gamesWithScores } });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                next(err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Submit game score
exports.gamesRouter.post('/:id/score', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var score, game, existingScore, isNewHighScore, gameScore, _a, today, alreadyEarnedToday, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                score = req.body.score;
                if (typeof score !== 'number' || score < 0) {
                    return [2 /*return*/, res.status(400).json({ status: 'error', message: 'Score inválido' })];
                }
                return [4 /*yield*/, prisma_js_1.prisma.game.findUnique({
                        where: { id: req.params.id },
                    })];
            case 1:
                game = _b.sent();
                if (!game) {
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Juego no encontrado' })];
                }
                return [4 /*yield*/, prisma_js_1.prisma.gameScore.findUnique({
                        where: { userId_gameId: { userId: req.user.id, gameId: game.id } },
                    })];
            case 2:
                existingScore = _b.sent();
                isNewHighScore = !existingScore || score > existingScore.score;
                if (!existingScore) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_js_1.prisma.gameScore.update({
                        where: { id: existingScore.id },
                        data: { score: score, completedAt: new Date() },
                    })];
            case 3:
                _a = _b.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, prisma_js_1.prisma.gameScore.create({
                    data: {
                        userId: req.user.id,
                        gameId: game.id,
                        score: score,
                    },
                })];
            case 5:
                _a = _b.sent();
                _b.label = 6;
            case 6:
                gameScore = _a;
                if (!isNewHighScore) return [3 /*break*/, 9];
                today = new Date();
                today.setHours(0, 0, 0, 0);
                return [4 /*yield*/, prisma_js_1.prisma.lessonProgress.findFirst({
                        where: {
                            userId: req.user.id,
                            completedAt: { gte: today },
                        },
                    })];
            case 7:
                alreadyEarnedToday = _b.sent();
                if (!!alreadyEarnedToday) return [3 /*break*/, 9];
                return [4 /*yield*/, prisma_js_1.prisma.user.update({
                        where: { id: req.user.id },
                        data: {
                            xp: { increment: game.xpReward },
                            coins: { increment: Math.floor(game.xpReward / 5) },
                        },
                    })];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9:
                res.json({
                    status: 'success',
                    data: {
                        gameScore: {
                            score: gameScore.score,
                            isNewHighScore: isNewHighScore,
                        },
                    },
                });
                return [3 /*break*/, 11];
            case 10:
                err_2 = _b.sent();
                next(err_2);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
