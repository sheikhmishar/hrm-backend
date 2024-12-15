import type { Request } from 'express'

import { ResponseError } from '../configs'
import { statusCodes } from '../controllers/_middlewares/response-code'

const { UNPROCESSABLE_ENTITY } = statusCodes

export const decodeMultipartBody = <T extends Request>(req: T): T['body'] => {
  if (!req.body.json)
    throw new ResponseError('Request body required', UNPROCESSABLE_ENTITY)
  if (typeof req.body.json !== 'string')
    throw new ResponseError('Request body limit exceeded', UNPROCESSABLE_ENTITY)
  try {
    return JSON.parse(req.body.json) as T['body']
  } catch (_) {
    throw new ResponseError('Invalid request body', UNPROCESSABLE_ENTITY)
  }
}
// NonNullable<T["body"]>
