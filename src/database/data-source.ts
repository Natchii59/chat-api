import { config } from 'dotenv'
import { DataSource } from 'typeorm'

import { join } from 'path'

config()

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  subscribers: [join(__dirname, '..', '**', '*.subscriber.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')]
})
