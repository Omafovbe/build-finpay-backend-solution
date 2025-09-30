import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'

class Beneficiary extends Model {
  public id!: number
  public userId!: number
  public name!: string
  public email!: string
  public phoneNumber!: string
  public bankName!: string
  public accountNumber!: string
  public accountType!: string
  public relationship!: string
  public isActive!: boolean
  public createdAt!: Date
  public updatedAt!: Date
}

Beneficiary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountType: {
      type: DataTypes.ENUM('Savings', 'Current', 'Checking'),
      allowNull: false,
    },
    relationship: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
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
    tableName: 'beneficiaries',
    timestamps: true,
  }
)

export default Beneficiary
