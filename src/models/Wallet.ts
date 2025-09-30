import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import User from './User'

class Wallet extends Model {
  public id!: string // Primary Key
  public userId!: number
  public balance!: number
  public currency!: string
}

Wallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
    // A user can't have two wallets with the same currency
    indexes: [{ unique: true, fields: ['userId', 'currency'] }],
  }
)

export default Wallet
