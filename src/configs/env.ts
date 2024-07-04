import { config } from 'dotenv'

config()

const nodeEnv = process.env.NODE_ENV

const env = {
  nodeEnv,
  production: nodeEnv === 'production',
  debugPrefix: process.env.DEBUG_PREFIX || '',
  debugOutputPath: process.env.DEBUG_OUT_PATH,
  port: parseInt(process.env.PORT),
  ip: process.env.IP,
  origin: process.env.ORIGIN,
  dbName: process.env.DB_NAME,
  dbPort: parseInt(process.env.DB_PORT),
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbDebug: process.env.DB_DEBUG,
  jwtKey: process.env.JWT_KEY,
  jwtIssuer: process.env.JWT_ISSUER
}

Object.entries(env).forEach(
  ([key, val]) =>
    typeof val === 'undefined' &&
    console.error('[WARN]: Undefined Environment Variable:', key)
)

export default env
