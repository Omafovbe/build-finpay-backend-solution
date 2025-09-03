import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import Customer from './Customer'

class Address extends Model {
  public id!: number // Auto-incrementing integer
  public customerId!: string // UUID, Foreign Key to Customer
  public country!: string
  public state!: string
  public line1!: string
  public line2!: string | null // Optional
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Address.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // One-to-one relationship
      references: {
        model: Customer,
        key: 'id',
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line2: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'address',
    timestamps: true,
  }
)

export default Address
