import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/schema/finpay.db',
  logging: false,
})

// export async function syncDatabase(
//   options: { force?: boolean; alter?: boolean } = { alter: true }
// ) {
//   await sequelize.authenticate()
//   // alter:true will try to ALTER tables to match models (non-destructive in many cases)
//   // force:true will DROP and recreate tables (destructive)
//   await sequelize.sync({ force: !!options.force, alter: !!options.alter })
//   console.log('Database synced', options)
// }

export { sequelize }
