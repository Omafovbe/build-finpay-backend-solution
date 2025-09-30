"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.Wallet = exports.Card = exports.Item = exports.Address = exports.Customer = exports.Invoice = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Invoice_1 = __importDefault(require("./Invoice"));
exports.Invoice = Invoice_1.default;
const Customer_1 = __importDefault(require("./Customer"));
exports.Customer = Customer_1.default;
const Address_1 = __importDefault(require("./Address"));
exports.Address = Address_1.default;
const Item_1 = __importDefault(require("./Item"));
exports.Item = Item_1.default;
const Card_1 = __importDefault(require("./Card"));
exports.Card = Card_1.default;
const Wallet_1 = __importDefault(require("./Wallet"));
exports.Wallet = Wallet_1.default;
const Transaction_1 = __importDefault(require("./Transaction"));
exports.Transaction = Transaction_1.default;
// Define Associations
User_1.default.hasMany(Invoice_1.default, { foreignKey: 'userId', as: 'invoices' });
Invoice_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
Invoice_1.default.belongsTo(Customer_1.default, { foreignKey: 'customerId', as: 'customer' });
Customer_1.default.hasMany(Invoice_1.default, { foreignKey: 'customerId', as: 'invoices' });
Address_1.default.belongsTo(Customer_1.default, { foreignKey: 'customerId', as: 'customer' });
Customer_1.default.hasOne(Address_1.default, { foreignKey: 'customerId', as: 'address' });
Item_1.default.belongsTo(Invoice_1.default, { foreignKey: 'invoiceId', as: 'invoice' });
Invoice_1.default.hasMany(Item_1.default, { foreignKey: 'invoiceId', as: 'items' });
// A User has many Wallet
User_1.default.hasMany(Wallet_1.default, { foreignKey: 'userId', as: 'wallet' });
Wallet_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
// A Wallet can have many Cards
Wallet_1.default.hasMany(Card_1.default, { foreignKey: 'walletId', as: 'cards' });
Card_1.default.belongsTo(Wallet_1.default, { foreignKey: 'walletId', as: 'wallet' });
// A Wallet has many Transactions
Wallet_1.default.hasMany(Transaction_1.default, { foreignKey: 'walletId', as: 'transactions' });
Transaction_1.default.belongsTo(Wallet_1.default, { foreignKey: 'walletId', as: 'wallet' });
//# sourceMappingURL=index.js.map