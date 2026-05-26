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
exports.authRouter = void 0;
var express_1 = require("express");
var passport_1 = require("passport");
var passport_google_oauth20_1 = require("passport-google-oauth20");
var bcryptjs_1 = require("bcryptjs");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
var shared_1 = require("@duobijac/shared");
var error_js_1 = require("../middlewares/error.js");
// Validate Google OAuth environment variables on startup
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google sign-in.');
}
else {
    // Configure Passport Google Strategy
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "".concat(process.env.API_URL || 'http://localhost:3001', "/api/auth/google/callback"),
    }, function (_accessToken, _refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
        var email, existingUser, newUser, err_1;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 6, , 7]);
                    if (!((_a = profile.emails) === null || _a === void 0 ? void 0 : _a.length)) {
                        return [2 /*return*/, done(new Error('No email found in Google profile'))];
                    }
                    email = profile.emails[0].value;
                    return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({ where: { email: email } })];
                case 1:
                    existingUser = _f.sent();
                    if (!existingUser) return [3 /*break*/, 4];
                    if (!!existingUser.googleId) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma_js_1.prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                googleId: profile.id,
                                avatar: ((_c = (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) || existingUser.avatar,
                                isRegisteredWithGoogle: true,
                            },
                        })];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3: return [2 /*return*/, done(null, { id: existingUser.id, email: existingUser.email, name: existingUser.name })];
                case 4: return [4 /*yield*/, prisma_js_1.prisma.user.create({
                        data: {
                            email: email,
                            name: profile.displayName || email.split('@')[0],
                            googleId: profile.id,
                            avatar: (_e = (_d = profile.photos) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value,
                            isRegisteredWithGoogle: true,
                        },
                    })];
                case 5:
                    newUser = _f.sent();
                    return [2 /*return*/, done(null, { id: newUser.id, email: newUser.email, name: newUser.name })];
                case 6:
                    err_1 = _f.sent();
                    return [2 /*return*/, done(err_1)];
                case 7: return [2 /*return*/];
            }
        });
    }); }));
}
exports.authRouter = (0, express_1.Router)();
// Register
exports.authRouter.post('/register', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var data, existing, passwordHash, user, token, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                data = shared_1.RegisterSchema.parse(req.body);
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({ where: { email: data.email } })];
            case 1:
                existing = _a.sent();
                if (existing) {
                    throw new error_js_1.AppError('El email ya está registrado', 400);
                }
                return [4 /*yield*/, bcryptjs_1.default.hash(data.password, 12)];
            case 2:
                passwordHash = _a.sent();
                return [4 /*yield*/, prisma_js_1.prisma.user.create({
                        data: {
                            email: data.email,
                            passwordHash: passwordHash,
                            name: data.name,
                        },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            avatar: true,
                            xp: true,
                            level: true,
                            coins: true,
                            currentStreak: true,
                            longestStreak: true,
                            role: true,
                            createdAt: true,
                        },
                    })];
            case 3:
                user = _a.sent();
                token = (0, auth_js_1.generateToken)(user.id);
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });
                res.status(201).json({ status: 'success', data: { user: user } });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                next(err_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Login
exports.authRouter.post('/login', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var data, user, valid, lastActive, now, dayDiff, newStreak, newLongestStreak, token, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                data = shared_1.LoginSchema.parse(req.body);
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({ where: { email: data.email } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new error_js_1.AppError('Credenciales inválidas', 401);
                }
                // Block Google-only users from email/password login
                if (user.isRegisteredWithGoogle && !user.passwordHash) {
                    throw new error_js_1.AppError('Este cuenta fue creada con Google. Por favor inicia sesión con Google.', 401);
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(data.password, user.passwordHash)];
            case 2:
                valid = _a.sent();
                if (!valid) {
                    throw new error_js_1.AppError('Credenciales inválidas', 401);
                }
                lastActive = new Date(user.lastActiveAt);
                now = new Date();
                dayDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
                newStreak = user.currentStreak;
                if (dayDiff === 1) {
                    newStreak += 1;
                }
                else if (dayDiff > 1) {
                    newStreak = 1;
                }
                newLongestStreak = Math.max(user.longestStreak, newStreak);
                return [4 /*yield*/, prisma_js_1.prisma.user.update({
                        where: { id: user.id },
                        data: { lastActiveAt: now, currentStreak: newStreak, longestStreak: newLongestStreak },
                    })];
            case 3:
                _a.sent();
                token = (0, auth_js_1.generateToken)(user.id);
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.json({
                    status: 'success',
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            avatar: user.avatar,
                            xp: user.xp,
                            level: user.level,
                            coins: user.coins,
                            currentStreak: newStreak,
                            longestStreak: newLongestStreak,
                            role: user.role,
                        },
                    },
                });
                return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                next(err_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Logout
exports.authRouter.post('/logout', function (_, res) {
    res.clearCookie('token');
    res.json({ status: 'success', message: 'Sesión cerrada' });
});
// Check if Google OAuth is configured
exports.authRouter.get('/google/status', function (_, res) {
    var configured = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
    res.json({
        status: 'success',
        data: {
            googleOAuthEnabled: configured
        }
    });
});
// Get current user
exports.authRouter.get('/me', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({
                        where: { id: req.user.id },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            avatar: true,
                            xp: true,
                            level: true,
                            coins: true,
                            currentStreak: true,
                            longestStreak: true,
                            lastActiveAt: true,
                            role: true,
                            createdAt: true,
                        },
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new error_js_1.AppError('Usuario no encontrado', 404);
                }
                res.json({ status: 'success', data: { user: user } });
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                next(err_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Google OAuth Routes
exports.authRouter.get('/google', function (req, res, next) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({
            status: 'error',
            message: 'Google OAuth no está configurado. Contacta al administrador.'
        });
    }
    next();
}, passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: Math.random().toString(36).substring(7),
}));
exports.authRouter.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: "".concat(process.env.FRONTEND_URL || 'http://localhost:3000', "/login?error=google_failed")
}), function (req, res, next) {
    try {
        // Generate JWT token for the user
        var token = (0, auth_js_1.generateToken)(req.user.id);
        // Set cookie and redirect to frontend
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // Redirect to dashboard
        var frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect("".concat(frontendUrl, "/dashboard?google_auth=success"));
    }
    catch (err) {
        next(err);
    }
});
