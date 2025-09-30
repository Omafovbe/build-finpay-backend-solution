import User from './User'
import Invoice from './Invoice'
import Customer from './Customer'
import Address from './Address'
import Item from './Item'
import Card from './Card'
import Wallet from './Wallet'
import Transaction from './Transaction'

// Define Associations
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' })
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' })

Address.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
Customer.hasOne(Address, { foreignKey: 'customerId', as: 'address' })

Item.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' })
Invoice.hasMany(Item, { foreignKey: 'invoiceId', as: 'items' })

// A User has many Wallet
User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallet' })
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// A Wallet can have many Cards
Wallet.hasMany(Card, { foreignKey: 'walletId', as: 'cards' })
Card.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' })

// A Wallet has many Transactions
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' })
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' })

export { User, Invoice, Customer, Address, Item, Card, Wallet, Transaction }
