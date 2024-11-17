import bcrypt from 'bcrypt'
import { IsNotEmpty, IsString } from 'class-validator'
import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader } from 'mysql2'

import User from '../Entities/User'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import env from '../configs/env'
import transformAndValidate from '../utils/transformAndValidate'
import type { AuthUser } from './_middlewares/authentication'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.users

export const allUsers: RequestHandler<{}, User[]> = async (_, res, next) => {
  try {
    res.json(
      (await AppDataSource.getRepository(User).find()).map(user => ({
        ...user,
        password: '******'
      }))
    )
  } catch (err) {
    next(err)
  }
}

export const userDetails: RequestHandler<
  Partial<typeof _params>,
  User
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const user = await AppDataSource.getRepository(User).findOneBy({ id })
    if (!user) throw new ResponseError(`No User with ID: ${id}`, NOT_FOUND)

    user.password = '******'
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export const selfDetails: RequestHandler<{}, AuthUser> = async (req, res) => {
  res.json(req.user)
}

export const registerUser: RequestHandler<
  {},
  { message: string; data: User },
  User
> = async (req, res, next) => {
  try {
    const existsSuperAdmin = await AppDataSource.getRepository(User).existsBy({
      type: 'SuperAdmin'
    })
    if (!existsSuperAdmin) req.body.type = 'SuperAdmin'

    const user = await transformAndValidate(User, { ...req.body })
    user.password = await bcrypt.hash(user.password, 10)

    const result = await AppDataSource.getRepository(User).insert(user)
    const userInsertResultRaw: ResultSetHeader = result.raw
    if (!userInsertResultRaw.affectedRows)
      throw new ResponseError('User Not Created', NOT_MODIFIED)

    user.password = '******'
    res
      .status(CREATED)
      .json({ message: 'Successfully Created User', data: user })
  } catch (err) {
    next(err)
  }
}

class LoginData {
  @IsString()
  @IsNotEmpty({ message: 'Required email or phone number' })
  inputData!: string

  @IsString()
  @IsNotEmpty({ message: 'Required password' })
  password!: string
}

export const loginUser: RequestHandler<
  {},
  { token: string },
  Partial<LoginData>
> = async (req, res, next) => {
  try {
    const body = await transformAndValidate(LoginData, req.body)

    const user = await AppDataSource.manager
      .getRepository(User)
      .findOneBy([{ email: body.inputData }, { name: body.inputData }])
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      throw new ResponseError('Invalid Login Credentials', NOT_FOUND)

    res.json({
      token: jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          employeeId:
            user.type === 'Employee' && user.employee
              ? user.employee.id
              : undefined,
          iat: Date.now()
        } satisfies AuthUser,
        env.jwtKey || '',
        { issuer: env.jwtIssuer }
      )
    })
  } catch (err) {
    next(err)
  }
}

export const updateUser: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: User }
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const prevUser = await AppDataSource.getRepository(User).findOneBy({ id })
    const user = await transformAndValidate(User, { ...prevUser, ...req.body })
    if (req.body.password)
      user.password = await bcrypt.hash(req.body.password, 10)

    const result = await AppDataSource.getRepository(User).update({ id }, user)
    if (!result.affected)
      throw new ResponseError(`No User with ID: ${id}`, NOT_FOUND)

    user.id = id
    user.password = '******'
    res.json({ message: 'User updated', data: user })
  } catch (err) {
    next(err)
  }
}
