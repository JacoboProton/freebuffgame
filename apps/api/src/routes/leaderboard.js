"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.leaderboardRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
exports.leaderboardRouter = (0, express_1.Router)();
// Get global leaderboard
exports.leaderboardRouter.get('/', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, period, _c, limit, dateFilter, weekAgo, users, leaderboard, userRank, userPosition, _d, _e, currentUser, err_1;
    var _f, _g, _h;
    var _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 6, , 7]);
                _a = req.query, _b = _a.period, period = _b === void 0 ? 'all' : _b, _c = _a.limit, limit = _c === void 0 ? 50 : _c;
                dateFilter = {};
                if (period === 'weekly') {
                    weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    dateFilter = { lastActiveAt: { gte: weekAgo } };
                }
                return [4 /*yield*/, prisma_js_1.prisma.user.findMany({
                        where: __assign({ role: 'user' }, dateFilter),
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            xp: true,
                            level: true,
                        },
                        orderBy: { xp: 'desc' },
                        take: Number(limit),
                    })];
            case 1:
                users = _k.sent();
                leaderboard = users.map(function (user, index) { return ({
                    rank: index + 1,
                    userId: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    xp: user.xp,
                    level: user.level,
                    isCurrentUser: user.id === req.user.id,
                }); });
                userRank = null;
                if (!!leaderboard.find(function (e) { return e.isCurrentUser; })) return [3 /*break*/, 5];
                _e = (_d = prisma_js_1.prisma.user).count;
                _f = {};
                _g = {};
                _h = {};
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({ where: { id: req.user.id }, select: { xp: true } })];
            case 2: return [4 /*yield*/, _e.apply(_d, [(_f.where = (_g.xp = (_h.gt = ((_j = (_k.sent())) === null || _j === void 0 ? void 0 : _j.xp) || 0, _h), _g.role = 'user', _g),
                        _f)])];
            case 3:
                userPosition = _k.sent();
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({
                        where: { id: req.user.id },
                        select: { id: true, name: true, avatar: true, xp: true, level: true },
                    })];
            case 4:
                currentUser = _k.sent();
                if (currentUser) {
                    userRank = {
                        rank: userPosition + 1,
                        userId: currentUser.id,
                        name: currentUser.name,
                        avatar: currentUser.avatar,
                        xp: currentUser.xp,
                        level: currentUser.level,
                        isCurrentUser: true,
                    };
                }
                _k.label = 5;
            case 5:
                res.json({
                    status: 'success',
                    data: {
                        leaderboard: leaderboard,
                        userRank: userRank,
                    },
                });
                return [3 /*break*/, 7];
            case 6:
                err_1 = _k.sent();
                next(err_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Get friends leaderboard
exports.leaderboardRouter.get('/friends', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var friends, friendIds, allIds, users, leaderboard, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma_js_1.prisma.friend.findMany({
                        where: { userId: req.user.id },
                        select: { friendId: true },
                    })];
            case 1:
                friends = _a.sent();
                friendIds = friends.map(function (f) { return f.friendId; });
                allIds = __spreadArray([req.user.id], friendIds, true);
                return [4 /*yield*/, prisma_js_1.prisma.user.findMany({
                        where: { id: { in: allIds }, role: 'user' },
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            xp: true,
                            level: true,
                        },
                        orderBy: { xp: 'desc' },
                    })];
            case 2:
                users = _a.sent();
                leaderboard = users.map(function (user, index) { return ({
                    rank: index + 1,
                    userId: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    xp: user.xp,
                    level: user.level,
                    isCurrentUser: user.id === req.user.id,
                }); });
                res.json({ status: 'success', data: { leaderboard: leaderboard } });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                next(err_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
