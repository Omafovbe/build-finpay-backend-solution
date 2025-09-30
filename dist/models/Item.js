"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../schema/db");
const sequelize_1 = require("sequelize");
const Invoice_1 = __importDefault(require("./Invoice"));
class Item extends sequelize_1.Model {
}
Item.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    invoiceId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Invoice_1.default,
            key: 'id',
        },
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'items',
    timestamps: true,
});
exports.default = Item;
//# sourceMappingURL=Item.js.map