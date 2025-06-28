import 'reflect-metadata'

import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

import http from 'http'

import Setting from './Entities/Setting'
import * as config from './configs'
import AppDataSource from './configs/db'
import env from './configs/env'
import middlewares from './controllers/_middlewares'
import SITEMAP from './controllers/_routes/SITEMAP'
import router from './controllers/_routes/api'
import { createDebug } from './utils/debug'
import { SETTINGS, SETTING_KEYS } from './utils/misc'

const app = express()
const server = http.createServer(app)

if (!env.production) {
  app.use(
    morgan('dev', {
      stream: { write: createDebug('morgan', { type: '%s' }) }
    })
  )
  app.use(middlewares.headersInspector)
}
app.set('name', 'hrm-backend')
app.disable('x-powered-by')
app.use(cors(config.corsConfig))
app.use((req, res, next) => {
  express.json({
    limit:
      req.method === 'POST' && req.path === SITEMAP.attendances.post
        ? '20mb'
        : undefined
  })(req, res, next)
})
// let requests = 1
// app.use((_, __, next) =>
//   setTimeout(() => requests-- && next(), requests++ * 1000)
// )
app.use(SITEMAP.static._, express.static(config.staticPath))
app.use(router)
app.use(middlewares.unknownRouteHandler)
app.use(middlewares.expressErrorHandler)

const PORT = env.port || 5000
const IP = env.ip || '127.0.0.1'

const debugSuccess = createDebug('server', config.dbgSuccOpt)
const debugError = createDebug('server', config.dbgErrOpt)
const debugDbError = createDebug('db', config.dbgErrOpt)
const debugDbSuccess = createDebug('db', config.dbgSuccOpt)
AppDataSource.initialize()
  .then(async ({ options }) => {
    debugDbSuccess(options)
    const setting = await AppDataSource.getRepository(Setting).findOneBy({
      property: SETTING_KEYS.PAYROLL_CYCLE_START_DATE
    })

    if (!setting) throw new Error('PAYROLL_CYCLE_START_DATE not set')

    SETTINGS.PAYROLL_CYCLE_START_DATE = parseInt(setting) || 0
  })
  .catch(debugDbError)
server
  .listen(PORT, IP)
  .on('listening', () => debugSuccess('Server listening on:', server.address()))
  .on('error', async err => {
    await AppDataSource.destroy().catch(debugDbError)
    server.close()
    debugError('Server closed due to error')
    if (err.code === 'EADDRINUSE') debugError(`Port ${PORT} in use`)
  })

const debugProcError = createDebug('process', config.dbgErrOpt)
const debugProcInfo = createDebug('process', config.dbgInfOpt)
const onSignal: NodeJS.SignalsListener = async signal => {
  debugProcInfo('Signal', signal)

  server.close(err => {
    if (err) {
      debugError(err)
      return process.exit(1)
    }
    debugSuccess('Server closed. EXITING')
    process.exit(0)
  })
}
process
  .on('uncaughtException', debugProcError)
  .on('unhandledRejection', debugProcError)
  .once('SIGINT', onSignal)
  .once('SIGUSR2', onSignal)
  .once('SIGHUP', onSignal)
