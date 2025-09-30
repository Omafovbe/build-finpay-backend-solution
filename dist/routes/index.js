"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardRoutes = exports.invoiceRoutes = exports.authRoutes = void 0;
const authRoutes_1 = __importDefault(require("./authRoutes"));
exports.authRoutes = authRoutes_1.default;
const invoiceRoute_1 = __importDefault(require("./invoiceRoute"));
exports.invoiceRoutes = invoiceRoute_1.default;
const cardRoutes_1 = __importDefault(require("./cardRoutes"));
exports.cardRoutes = cardRoutes_1.default;
//# sourceMappingURL=index.js.map