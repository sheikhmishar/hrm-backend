import { ValidationError } from 'class-validator'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import type { MulterError } from 'multer'
import type { QueryError } from 'mysql2'
import { EntityMetadataNotFoundError } from 'typeorm'

import { dbgErrOpt, dbgInfOpt, ResponseError } from '../../configs'
import AppDataSource from '../../configs/db'
import env from '../../configs/env'
import {
  duplicateEntryError,
  foreignKeyError,
  SQL_DUP_ENTITY_REGEX,
  SQL_REF_ENTITY_REGEX
} from '../../utils/dbHelpers'
import { createDebug } from '../../utils/debug'
import { capitalizeDelim, singularify } from '../../utils/misc'
import { getStatusText, statusCodes } from './response-code'

const { INTERNAL_SERVER_ERROR, NOT_FOUND, UNPROCESSABLE_ENTITY } = statusCodes

const debugHeaders = createDebug('middleware:headersInspector', dbgInfOpt)
const headersInspector: RequestHandler = ({ headers }, _, next) => {
  debugHeaders(headers)
  next()
}

const unknownRouteHandler: RequestHandler = (_, __, next) =>
  next(new ResponseError(getStatusText(NOT_FOUND), NOT_FOUND))

export const matchFlatRouterRootPath = (rootPath: string) =>
  (({ path }, _, next) =>
    path.startsWith(rootPath) ? next() : next('router')) as RequestHandler

const debugError = createDebug('middleware:expressErrorHandler', dbgErrOpt)

const serverErrors = [
  'ENOENT', // FILE_LOCATION
  'ECONNREFUSED', // NODE/MYSQL
  'ENOTFOUND' // HTTP REQUEST
]

import { snakeCase } from 'typeorm/util/StringUtils'

type ErrorHandler = ErrorRequestHandler<{}, { message: string }>
const expressErrorHandler: ErrorHandler = async (err: Error, _, res, __) => {
  if (
    (err.code === serverErrors[1] && err.name === 'AggregateError') || // ECONNREFUSED
    err instanceof EntityMetadataNotFoundError
  )
    await AppDataSource.initialize()

  const responseError = new ResponseError(err.message, err.status)

  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    responseError.status = UNPROCESSABLE_ENTITY
    responseError.message = (err as ValidationError[])
      .slice(0, env.production ? 1 : err.length)
      .reduce((result, { constraints, property, target }) => {
        const message = Object.values(constraints || {}).reduce(
          (concatted, curr) =>
            concatted.concat(
              curr
                ? (concatted ? ', ' : '') +
                    (target?.constructor.name || '') +
                    ' ' +
                    curr.replace(property, capitalizeDelim(snakeCase(property)))
                : ''
            ),
          ''
        )
        return result + (message ? (result ? ' | ' : '') + message : '')
      }, '')
  } else if (serverErrors.includes(err.code))
    responseError.message = getStatusText(INTERNAL_SERVER_ERROR)
  else if (err.code === foreignKeyError) {
    const error = err as QueryError
    responseError.status = UNPROCESSABLE_ENTITY
    const entity =
      new RegExp(SQL_REF_ENTITY_REGEX).exec(error.sqlMessage || '')?.groups
        ?.table || ''
    responseError.message = `Unknown '${capitalizeDelim(
      singularify(entity)
    )}' Entry`
  } else if (err.code === duplicateEntryError) {
    const error = err as QueryError
    responseError.status = UNPROCESSABLE_ENTITY
    const entity =
      new RegExp(SQL_DUP_ENTITY_REGEX).exec(error.sqlMessage || '')?.groups
        ?.column_idx || ''
    responseError.message = `Duplicate '${capitalizeDelim(
      singularify(entity)
    )}'`
  } else if (err.name === 'MulterError') {
    const error = err as MulterError
    responseError.status = UNPROCESSABLE_ENTITY
    if (error.field) responseError.message += ` '${error.field}'`
  }

  if (!env.production) debugError(err)
  if (res.headersSent) return debugError('Headers Sent')

  const status = responseError.status
  const message =
    status >= 500
      ? getStatusText(status)
      : responseError.message || getStatusText(status)

  res.status(status).json({ message })
}

export default {
  headersInspector,
  expressErrorHandler,
  unknownRouteHandler
}

// TODO: constraints: { unknownValue: 'an unknown value was passed to the validate function' }
