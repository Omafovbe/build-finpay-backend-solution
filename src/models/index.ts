import User from './User'
import Invoice from './Invoice'
import Customer from './Customer'
import Address from './Address'
import Item from './Item'

// Define Associations
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' })
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' })

Address.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
Customer.hasOne(Address, { foreignKey: 'customerId', as: 'address' })

Item.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' })
Invoice.hasMany(Item, { foreignKey: 'invoiceId', as: 'items' })

export { User, Invoice, Customer, Address, Item }
