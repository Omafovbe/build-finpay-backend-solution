import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import User from './User'

class Account extends Model {
  public id!: string
  public userId!: number
  public currency!: string
  public accountHolder!: string
  public bankName!: string
  public accountNumber!: string
  public routingNumber!: string
  public accountType!: string
  public address!: string
  public isActive!: boolean
  public createdAt!: Date
  public updatedAt!: Date

  // Association mixins
  public readonly user?: User
}

Account.init(
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
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
      validate: {
        isIn: [['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD']],
      },
    },
    accountHolder: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'WELLS FARGO BANK, N.A.',
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    routingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountType: {
      type: DataTypes.ENUM('checking', 'savings', 'business'),
      allowNull: false,
      defaultValue: 'checking',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'accounts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['accountNumber'],
        unique: true,
      },
      {
        fields: ['userId', 'currency'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
)

export default Account
