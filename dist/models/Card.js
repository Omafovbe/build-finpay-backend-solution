"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../schema/db");
const sequelize_1 = require("sequelize");
const Wallet_1 = __importDefault(require("./Wallet"));
class Card extends sequelize_1.Model {
}
Card.init({
    card_reference: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    reference: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD',
    },
    holder_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    brand: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    expiry_month: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    expiry_year: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    first_six: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    last_four: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    fees: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    walletId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: Wallet_1.default,
            key: 'id',
        },
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'cards',
    timestamps: true,
});
exports.default = Card;
//# sourceMappingURL=Card.js.map