import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import User from './User'
import Customer from './Customer'

class Invoice extends Model {
  public id!: string // UUID
  public customerId!: string // UUID, Foreign Key to Customer
  public currency!: string
  public issueDate!: Date
  public dueDate!: Date
  public userId!: number // Foreign Key to User
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Customer,
        key: 'id',
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'invoices',
    timestamps: true,
  }
)

export default Invoice
