import { ValidationError } from 'class-validator'
import type { RequestHandler } from 'express'
import type { QueryError } from 'mysql2'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

import Company from '../Entities/Company'
import Employee from '../Entities/Employee'
import EmployeeAttendance from '../Entities/EmployeeAttendance'
import EmployeeLeave from '../Entities/EmployeeLeave'
import Holiday from '../Entities/Holiday'
import Setting from '../Entities/Setting'
import IdParams, { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError, dbgErrOpt } from '../configs'
import AppDataSource from '../configs/db'
import env from '../configs/env'
import { foreignKeyError } from '../utils/dbHelpers'
import { createDebug } from '../utils/debug'
import {
  BEGIN_DATE,
  END_DATE,
  capitalizeDelim,
  stringToDate,
  timeToDate
} from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND } = statusCodes
const { _params, _queries } = SITEMAP.attendances

async function modifyAttendance(
  employee: Employee,
  attendance: EmployeeAttendance,
  settings: Setting[]
) {
  const arrivalTime = timeToDate(attendance.arrivalTime).getTime()
  const leaveTime = timeToDate(attendance.leaveTime).getTime()
  let late =
    employee.checkedInLateFee === 'applicable'
      ? Math.ceil(
          (arrivalTime - timeToDate(employee.officeStartTime).getTime()) / 60000
        )
      : -1
  attendance.totalTime = Math.ceil((leaveTime - arrivalTime) / 60000)
  const isHoliday = await AppDataSource.getRepository(Holiday).existsBy({
    date: attendance.date
  })
  let overtime =
    employee.overtime === 'applicable'
      ? isHoliday
        ? attendance.totalTime
        : Math.ceil(
            (leaveTime - timeToDate(employee.officeEndTime).getTime()) / 60000
          )
      : -1

  // TODO: pass via param
  const lateGracePeriod = parseInt(
    settings.find(
      setting => setting.property === 'ATTENDANCE_ENTRY_GRACE_PERIOD'
    )?.value || '0m'
  )
  const overtimeGracePeriod = parseInt(
    settings.find(
      setting => setting.property === 'ATTENDANCE_LEAVE_GRACE_PERIOD'
    )?.value || '0m'
  )
  if (late > -1) late = late > lateGracePeriod ? late - lateGracePeriod : 0
  if (overtime > -1)
    overtime =
      overtime > overtimeGracePeriod ? overtime - overtimeGracePeriod : 0

  attendance.late = late
  attendance.overtime = overtime

  return attendance
}

export const allEmployeeAttendances: RequestHandler<
  {},
  Employee[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const [attendances, employees] = await Promise.all([
      AppDataSource.getRepository(EmployeeAttendance).find({
        where: {
          date: And(
            MoreThanOrEqual(req.query.from || BEGIN_DATE),
            LessThanOrEqual(req.query.to || END_DATE)
          ),
          employee: { dateOfJoining: LessThanOrEqual(req.query.to || END_DATE) }
        },
        relations: { employee: true }
      }),

      AppDataSource.getRepository(Employee).find({
        order: { id: 'desc' },
        where: { dateOfJoining: LessThanOrEqual(req.query.to || END_DATE) }
      })
    ])

    res.json(
      employees.map(
        employee =>
          Object.assign(employee, {
            attendances: attendances.filter(
              ({ employee: { id } }) => employee.id === id
            )
          } satisfies Partial<Employee>) as Employee
      )
    )
  } catch (err) {
    next(err)
  }
}

export const companyWiseAttendance: RequestHandler<
  {},
  (Company & { employees: Employee[] })[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const date = req.query.date || ''
    const [companies, employees, attendances, paidLeaves] = await Promise.all([
      AppDataSource.getRepository(Company).find(),

      AppDataSource.getRepository(Employee).find({
        order: { id: 'desc' },
        where: { dateOfJoining: LessThanOrEqual(date), status: 'active' }
      }),

      AppDataSource.getRepository(EmployeeAttendance).find({
        where: {
          date,
          employee: { dateOfJoining: LessThanOrEqual(date), status: 'active' }
        },
        relations: { employee: true }
      }),

      AppDataSource.getRepository(EmployeeLeave).find({
        where: {
          from: LessThanOrEqual(date),
          to: MoreThanOrEqual(date),
          type: 'paid',
          employee: { dateOfJoining: LessThanOrEqual(date), status: 'active' }
        },
        relations: { employee: true }
      })
    ])

    res.json(
      companies.map(company =>
        Object.assign(company, {
          employees: employees
            .filter(({ company: { id } }) => id === company.id)
            .map(
              employee =>
                Object.assign(employee, {
                  attendances: attendances.filter(
                    ({ employee: { id } }) => id === employee.id
                  ),
                  leaves: paidLeaves.filter(
                    ({ employee: { id } }) => id === employee.id
                  )
                } satisfies Partial<Employee>) as Employee
            )
        })
      )
    )
  } catch (err) {
    next(err)
  }
}

export const employeeAttendanceDetails: RequestHandler<
  Partial<typeof _params>,
  Employee,
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

    const employeeAttendance = await AppDataSource.getRepository(
      Employee
    ).findOne({
      where: {
        id: employeeId,
        attendances: {
          date: And(
            MoreThanOrEqual(req.query.from || BEGIN_DATE),
            LessThanOrEqual(req.query.to || END_DATE)
          )
        }
      },
      relations: { attendances: true }
    })
    if (!employeeAttendance)
      throw new ResponseError('No Employee with criteria', NOT_FOUND)

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
  const currentDate = new Date()
  try {
    if (!Array.isArray(req.body) || !req.body.length) {
      const error = new ResponseError('Invalid attendance list')
      error.status = 422
      throw error
    }
    const settings = await AppDataSource.manager.find(Setting)
    const data: { error?: string }[] = []
    for (let i = 0; i < req.body.length; i++) {
      try {
        const attendance = await transformAndValidate(
          EmployeeAttendance,
          req.body[i]
        )
        if (req.body[i]?.employee.id)
          attendance.employee.id = req.body[i]!.employee.id

        if (stringToDate(attendance.date) > currentDate) {
          data.push({ error: 'Cannot add attendance in future date' })
          continue
        }
        let alreadyExists = await AppDataSource.manager.existsBy(Employee, {
          id: attendance.employee.id,
          attendances: { date: attendance.date }
        })
        if (alreadyExists) {
          data.push({
            error: 'Attendance entry already exists at the same date'
          })
          continue
        }
        alreadyExists = await AppDataSource.manager.existsBy(EmployeeLeave, {
          type: 'paid',
          duration: 'fullday',
          employee: { id: attendance.employee.id },
          from: LessThanOrEqual(attendance.date),
          to: MoreThanOrEqual(attendance.date)
        })
        if (alreadyExists) {
          data.push({
            error: 'Fullday Paid leave already exists at the same date'
          })
          continue
        }
        const employee = await AppDataSource.manager.findOneBy(Employee, {
          id: attendance.employee.id
        })
        if (!employee) {
          data.push({ error: 'Invalid Employee' })
          continue
        }
        if (employee.status !== 'active') {
          data.push({ error: 'Inactive Employee' })
          continue
        }

        const isHoliday = await AppDataSource.getRepository(Holiday).existsBy({
          date: attendance.date
        })
        if (employee.overtime === 'inApplicable' && isHoliday) {
          data.push({ error: 'Employee overtime not applicable at holiday' })
          continue
        }

        await modifyAttendance(employee, attendance, settings)
        await AppDataSource.manager.insert(EmployeeAttendance, attendance)
        data.push({})
      } catch (error) {
        debugError(
          error,
          Array.isArray(error),
          Array.isArray(error) && error[0] instanceof ValidationError
        )
        if (error instanceof ValidationError && Object.keys(error).length) {
          data.push({ error: Object.values(error).find(v => v) || '' })
          continue
        }
        if (Array.isArray(error) && error[0] instanceof ValidationError) {
          data.push({
            error: (error as ValidationError[])
              .slice(0, env.production ? 1 : error.length)
              .reduce((result, { constraints, property }) => {
                const message = Object.values(constraints || {}).reduce(
                  (concatted, curr) =>
                    concatted.concat(
                      curr
                        ? (concatted ? ', ' : '') +
                            curr.replace(
                              property,
                              capitalizeDelim(snakeCase(property))
                            )
                        : ''
                    ),
                  ''
                )
                return result + (message ? (result ? ' | ' : '') + message : '')
              }, '')
          })
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

export const deleteEmployeeAttendance: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const result = await AppDataSource.getRepository(EmployeeAttendance).delete(
      { id }
    )
    if (!result.affected)
      throw new ResponseError(`No Attendance with ID: ${id}`, NOT_FOUND)

    res.json({
      message: `Successfully deleted Attendance Entry with ID: ${id}`
    })
  } catch (err) {
    next(err)
  }
}
