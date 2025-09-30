import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import Wallet from './Wallet'

class Card extends Model {
  public card_reference!: string // Primary Key
  public reference!: string
  public type!: string
  public currency!: string
  public holder_name!: string
  public brand!: string
  public expiry_month!: string
  public expiry_year!: string
  public first_six!: string
  public last_four!: string
  public status!: string
  public date!: Date
  public fees!: number
  public walletId!: string // Foreign key
}

Card.init(
  {
    card_reference: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
    holder_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiry_month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiry_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_six: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_four: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fees: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    walletId: {
      type: DataTypes.STRING, // Assuming walletId is a string. Adjust if it's a UUID.
      allowNull: false,
      references: {
        model: Wallet,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'cards',
    timestamps: true,
  }
)

export default Card
