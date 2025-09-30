"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../schema/db");
const sequelize_1 = require("sequelize");
const Wallet_1 = __importDefault(require("./Wallet"));
class Transaction extends sequelize_1.Model {
}
Transaction.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    walletId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Wallet_1.default,
            key: 'id',
        },
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('credit', 'debit'),
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'completed',
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'transactions',
    timestamps: true,
});
exports.default = Transaction;
//# sourceMappingURL=Transaction.js.map