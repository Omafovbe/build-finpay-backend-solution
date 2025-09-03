import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/schema/finpay.db',
  logging: false,
})

export { sequelize }
