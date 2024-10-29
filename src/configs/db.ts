import path from 'path'
import { DataSource } from 'typeorm'
import { type ConnectionOptions } from 'mysql2'

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
  debug: false,
  extra: { decimalNumbers: true } satisfies ConnectionOptions
})

export default AppDataSource
