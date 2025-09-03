import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

class Customer extends Model {
  public id!: string // UUID
  public name!: string
  public email!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
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
    tableName: 'customers',
    timestamps: true,
  }
)

export default Customer
