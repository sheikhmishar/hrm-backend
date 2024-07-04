import type { RequestHandler } from 'express'

export type GetReqParamsType<T extends RequestHandler> =
  Parameters<T>[0]['params']
export type GetReqQueryType<T extends RequestHandler> =
  Parameters<T>[0]['query']
export type GetReqBodyType<T extends RequestHandler> = Parameters<T>[0]['body']
export type GetResponseType<T extends RequestHandler> = Parameters<
  Parameters<T>[1]['json']
>[0]
