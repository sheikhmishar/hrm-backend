import {
  IsEmail,
  IsIn,
  IsNumber,
  IsPositive,
  IsString,
  Length
} from 'class-validator'
import { type RequestHandler } from 'express'
import jwt, { type Jwt, type JwtPayload } from 'jsonwebtoken'

import User from '../../Entities/User'
import { ResponseError } from '../../configs'
import AppDataSource from '../../configs/db'
import env from '../../configs/env'
import transformAndValidate from '../../utils/transformAndValidate'
import { statusCodes } from './response-code'

export class AuthUser {
  @IsNumber()
  @IsPositive()
  id!: number

  @IsString()
  @Length(1)
  name!: string

  @IsString()
  @IsEmail()
  @Length(6)
  email!: string

  @IsNumber()
  @IsPositive()
  iat!: number

  @IsIn([...User.TYPES, undefined])
  type!: (typeof User.TYPES)[number]
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

const { UNAUTHORIZED } = statusCodes

export const isAuthenticated: RequestHandler = async (req, _, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader)
      throw new ResponseError('Authentication Header Unavailable', UNAUTHORIZED)

    let decodedToken: Jwt | JwtPayload | string
    try {
      decodedToken = jwt.verify(
        authHeader.replace('Bearer ', ''),
        env.jwtKey || '',
        { issuer: env.jwtIssuer }
      )
    } catch (error) {
      throw new ResponseError('Broken Authentication Token', UNAUTHORIZED)
    }
    if (!decodedToken)
      throw new ResponseError('Invalid Authentication Token', UNAUTHORIZED)

    const validatedUser = await transformAndValidate(AuthUser, decodedToken)

    const user = await AppDataSource.manager.findOneBy(User, {
      email: validatedUser.email,
      id: validatedUser.id,
      type: validatedUser.type,
      name: validatedUser.name
    })
    if (!user) throw new ResponseError('Invalid User', UNAUTHORIZED)

    req.user = validatedUser

    next()
  } catch (error) {
    next(error)
  }
}
