"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../schema/db");
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("./User"));
const Customer_1 = __importDefault(require("./Customer"));
class Invoice extends sequelize_1.Model {
}
Invoice.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    customerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Customer_1.default,
            key: 'id',
        },
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    issueDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    dueDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'draft', 'paid'),
        allowNull: false,
        defaultValue: 'pending',
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
    tableName: 'invoices',
    timestamps: true,
});
exports.default = Invoice;
//# sourceMappingURL=Invoice.js.map