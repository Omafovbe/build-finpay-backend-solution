"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: './src/schema/finpay.db',
    logging: false,
});
exports.sequelize = sequelize;
//# sourceMappingURL=db.js.map