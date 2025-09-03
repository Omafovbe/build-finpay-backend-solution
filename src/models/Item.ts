import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import Invoice from './Invoice'

class Item extends Model {
  public id!: number // Auto-incrementing integer
  public invoiceId!: string // UUID, Foreign Key to Invoice
  public description!: string
  public quantity!: number
  public amount!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Invoice,
        key: 'id',
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // Adjust precision as needed
      allowNull: false,
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
    tableName: 'items',
    timestamps: true,
  }
)

export default Item
