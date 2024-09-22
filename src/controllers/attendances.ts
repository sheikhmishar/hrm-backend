import { IsNumber, IsPositive, ValidationError } from 'class-validator'
import type { RequestHandler } from 'express'
import type { QueryError } from 'mysql2'
import { dbgErrOpt } from '../configs'
import { createDebug } from '../utils/debug'

import Employee from '../Entities/Employee'
import EmployeeAttendance from '../Entities/ExployeeAttendance'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { foreignKeyError } from '../utils/dbHelpers'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND } = statusCodes
const { _params } = SITEMAP.attendances

export const allEmployeeAttendances: RequestHandler<{}, Employee[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(
      await AppDataSource.getRepository(Employee).find({
        relations: { attendances: true }
      })
    )
  } catch (err) {
    next(err)
  }
}

class EmployeeIdParams {
  @IsNumber()
  @IsPositive()
  employeeId!: number // TODO: get param name from _query
}
export const employeeAttendanceDetails: RequestHandler<
  Partial<typeof _params>,
  Employee
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

    const employeeAttendance = await AppDataSource.getRepository(
      Employee
    ).findOne({ where: { id: employeeId }, relations: { attendances: true } })
    if (!employeeAttendance)
      throw new ResponseError(`No Employee with ID: ${employeeId}`, NOT_FOUND)
    res.json(employeeAttendance)
  } catch (err) {
    next(err)
  }
}

const debugError = createDebug('controller:attendance', dbgErrOpt)

export const addEmployeeAttendance: RequestHandler<
  {},
  { message: string; data?: { error?: string }[] },
  EmployeeAttendance[]
> = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || !req.body.length) {
      const error = new ResponseError('Invalid attendance list')
      error.status = 422
      throw error
    }
    const data: { error?: string }[] = []
    for (let i = 0; i < req.body.length; i++) {
      try {
        const attendance = await transformAndValidate(
          EmployeeAttendance,
          req.body[i]
        )
        if (req.body[i]?.id) attendance.id = req.body[i]!.id
        if (req.body[i]?.employee.id)
          attendance.employee.id = req.body[i]!.employee.id

        const alreadyExists = await AppDataSource.manager.exists(Employee, {
          where: {
            id: attendance.employee.id,
            attendances: { date: attendance.date }
          }
        })
        if (alreadyExists) {
          data.push({
            error: 'Attendance entry already exists at the same date'
          })
          continue
        }

        await AppDataSource.manager.insert(EmployeeAttendance, attendance)
        data.push({})
      } catch (error) {
        debugError(error)
        if (error instanceof ValidationError && Object.keys(error).length) {
          data.push({ error: Object.values(error).find(v => v) || '' })
          continue
        }
        const mysqlError = error as QueryError
        if (mysqlError.code === foreignKeyError) {
          const errorDetails = mysqlError.message.match(
            /FOREIGN KEY \(`(.+?)`\) REFERENCES `(.+?)`/
          )
          if (errorDetails && errorDetails.length === 3) {
            const columnName = errorDetails[1]
            data.push({
              error: `Invalid ${columnName?.replace('_id_', '') || 'Data'}`
            })
            continue
          }
        }
        data.push({ error: 'Critical Error' })
      }
    }

    res.status(CREATED).json({ message: 'Attendance Processed', data })
  } catch (err) {
    next(err)
  }
}

export const updateEmployeeAttendance: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: EmployeeAttendance },
  Partial<EmployeeAttendance>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousAttendance = await AppDataSource.getRepository(
      EmployeeAttendance
    ).findOne({
      where: { id },
      relations: { employee: true }
    })
    if (!previousAttendance)
      throw new ResponseError(`No Attendance with ID: ${id}`, NOT_FOUND)

    const attendance = await transformAndValidate(EmployeeAttendance, {
      ...previousAttendance,
      ...req.body
    })

    attendance.employee.id =
      req.body.employee?.id || previousAttendance.employee.id

    await AppDataSource.manager.update(EmployeeAttendance, { id }, attendance)

    res.json({ message: 'Attendance updated', data: attendance })
  } catch (err) {
    next(err)
  }
}
