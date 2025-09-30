import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import Wallet from './Wallet'

class Transaction extends Model {
  public id!: string
  public walletId!: string
  public type!: 'credit' | 'debit'
  public amount!: number
  public status!: 'pending' | 'completed' | 'failed'
  public description!: string
  public currency!: string
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Wallet,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'completed',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
  }
)

export default Transaction
