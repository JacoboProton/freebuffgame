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
exports.shopRouter = void 0;
var express_1 = require("express");
var prisma_js_1 = require("../lib/prisma.js");
var auth_js_1 = require("../middlewares/auth.js");
exports.shopRouter = (0, express_1.Router)();
// Get all shop items
exports.shopRouter.get('/items', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var items, purchases, purchasedSet_1, itemsWithStatus, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma_js_1.prisma.shopItem.findMany({
                        orderBy: { price: 'asc' },
                    })];
            case 1:
                items = _a.sent();
                return [4 /*yield*/, prisma_js_1.prisma.purchase.findMany({
                        where: { userId: req.user.id },
                        select: { itemId: true },
                    })];
            case 2:
                purchases = _a.sent();
                purchasedSet_1 = new Set(purchases.map(function (p) { return p.itemId; }));
                itemsWithStatus = items.map(function (item) { return ({
                    id: item.id,
                    key: item.key,
                    name: item.name,
                    description: item.description,
                    type: item.type,
                    price: item.price,
                    icon: item.icon,
                    config: item.config,
                    owned: purchasedSet_1.has(item.id),
                }); });
                res.json({ status: 'success', data: { items: itemsWithStatus } });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                next(err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Purchase item
exports.shopRouter.post('/purchase', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var itemId, item, existingPurchase, user, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                itemId = req.body.itemId;
                return [4 /*yield*/, prisma_js_1.prisma.shopItem.findUnique({
                        where: { id: itemId },
                    })];
            case 1:
                item = _a.sent();
                if (!item) {
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Item no encontrado' })];
                }
                return [4 /*yield*/, prisma_js_1.prisma.purchase.findUnique({
                        where: { userId_itemId: { userId: req.user.id, itemId: item.id } },
                    })];
            case 2:
                existingPurchase = _a.sent();
                if (existingPurchase) {
                    return [2 /*return*/, res.status(400).json({ status: 'error', message: 'Ya tienes este item' })];
                }
                return [4 /*yield*/, prisma_js_1.prisma.user.findUnique({
                        where: { id: req.user.id },
                        select: { coins: true },
                    })];
            case 3:
                user = _a.sent();
                if (!user || user.coins < item.price) {
                    return [2 /*return*/, res.status(400).json({ status: 'error', message: 'No tienes suficientes coins' })];
                }
                // Process purchase
                return [4 /*yield*/, prisma_js_1.prisma.$transaction([
                        prisma_js_1.prisma.user.update({
                            where: { id: req.user.id },
                            data: { coins: { decrement: item.price } },
                        }),
                        prisma_js_1.prisma.purchase.create({
                            data: {
                                userId: req.user.id,
                                itemId: item.id,
                                coins: item.price,
                            },
                        }),
                    ])];
            case 4:
                // Process purchase
                _a.sent();
                res.json({
                    status: 'success',
                    data: {
                        purchased: {
                            itemId: item.id,
                            name: item.name,
                            type: item.type,
                        },
                    },
                });
                return [3 /*break*/, 6];
            case 5:
                err_2 = _a.sent();
                next(err_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Create Stripe checkout session (placeholder for Stripe integration)
exports.shopRouter.post('/checkout', auth_js_1.authenticate, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var packageId, packages, pkg;
    return __generator(this, function (_a) {
        try {
            packageId = req.body.packageId;
            packages = {
                small: { coins: 100, price: 0.99 },
                medium: { coins: 500, price: 4.99 },
                large: { coins: 1200, price: 9.99 },
            };
            pkg = packages[packageId];
            if (!pkg) {
                return [2 /*return*/, res.status(400).json({ status: 'error', message: 'Paquete no válido' })];
            }
            // In production, this would create a Stripe Checkout session
            // For now, return a mock URL
            res.json({
                status: 'success',
                data: {
                    checkoutUrl: "/shop/mock-checkout?package=".concat(packageId, "&coins=").concat(pkg.coins),
                    coins: pkg.coins,
                    price: pkg.price,
                },
            });
        }
        catch (err) {
            next(err);
        }
        return [2 /*return*/];
    });
}); });
