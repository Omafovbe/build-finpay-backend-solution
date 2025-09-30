import { sequelize } from '../schema/db'
import { Model, DataTypes } from 'sequelize'
import User from './User'

class Notification extends Model {
  public id!: string
  public userId!: number
  public title!: string
  public message!: string
  public type!: 'info' | 'success' | 'warning' | 'error'
  public isRead!: boolean
  public data!: string | null // JSON string for additional data
  public createdAt!: Date
  public updatedAt!: Date

  // Association mixins
  public readonly user?: User
}

Notification.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      allowNull: false,
      defaultValue: 'info',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    data: {
      type: DataTypes.TEXT,
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
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['userId', 'isRead'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
)

// // Define associations
// Notification.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
// })

// User.hasMany(Notification, {
//   foreignKey: 'userId',
//   as: 'notifications',
// })

export default Notification
