"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../schema/db");
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("./User"));
class Wallet extends sequelize_1.Model {
}
Wallet.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD',
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'wallets',
    timestamps: true,
    // A user can't have two wallets with the same currency
    indexes: [{ unique: true, fields: ['userId', 'currency'] }],
});
exports.default = Wallet;
//# sourceMappingURL=Wallet.js.map