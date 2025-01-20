import type { CorsOptions } from 'cors'
import mime from 'mime'
import type { Options as MulterOptions } from 'multer'

import path from 'path'
import fs from 'fs'

import {
  getStatusText,
  statusCodes
} from '../controllers/_middlewares/response-code'
import type { DebugOptions } from '../utils/debug'

export const staticPath = path.join(__dirname, '../../static')
export const employeePhotoDirName = 'employee_photos'
export const employeePhotosPath = path.join(staticPath, employeePhotoDirName)
export const employeeDocumentDirName = 'employee_documents'
export const employeeDocumentsPath = path.join(
  staticPath,
  employeeDocumentDirName
)

if (!fs.existsSync(employeePhotosPath))
  fs.mkdirSync(employeePhotosPath, { recursive: true })
if (!fs.existsSync(employeeDocumentsPath))
  fs.mkdirSync(employeeDocumentsPath, { recursive: true })

const { UNSUPPORTED_MEDIA_TYPE, INTERNAL_SERVER_ERROR } = statusCodes

export const dbgSuccOpt: DebugOptions = {
  badge: { bgColor: 'bgGreen', fgColor: 'black' },
  message: 'SUCCESS',
  color: 'green'
}

export const dbgErrOpt: DebugOptions = {
  badge: { bgColor: 'bgRed', fgColor: 'black' },
  message: 'ERROR',
  color: 'red'
}

export const dbgInfOpt: DebugOptions = {
  badge: { bgColor: 'bgBlueBright', fgColor: 'whiteBright' },
  message: 'INFO',
  color: 'blueBright'
}

export class ResponseError extends Error {
  public status: number
  public code?: string
  constructor(
    message = getStatusText(INTERNAL_SERVER_ERROR),
    status = INTERNAL_SERVER_ERROR,
    code?: string
  ) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const corsConfig: CorsOptions = {
  credentials: true,
  optionsSuccessStatus: 204,
  origin: true,
  maxAge: 60 * 60,
  exposedHeaders: ['*', 'authorization']
}

const isImageType = ({ mimetype, originalname }: Express.Multer.File) =>
  mimetype.startsWith('image') && mime.lookup(originalname)?.startsWith('image')

export const multerImageFileFilter: MulterOptions['fileFilter'] = (
  _,
  file,
  cb
) => {
  if (isImageType(file)) return cb(null, true)

  cb(new ResponseError('File Must be Image', UNSUPPORTED_MEDIA_TYPE))
}
