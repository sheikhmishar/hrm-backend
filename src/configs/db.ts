import path from 'path'
import { DataSource } from 'typeorm'

import env from './env'

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: env.dbPort || 3306,
  username: env.dbUser,
  password: env.dbPass,
  database: env.dbName,
  timezone: '+00:00',
  entities: [path.join(__dirname, '../Entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../Entities/migrations/**/*.{ts,js}')],
  synchronize: false,
  logging: !env.production,
  debug: false
})

export default AppDataSource
