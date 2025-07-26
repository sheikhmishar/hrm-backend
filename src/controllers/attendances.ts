import {
  IsDateString,
  IsNotEmpty,
  Matches,
  ValidationError
} from 'class-validator'
import type { RequestHandler } from 'express'
import type { QueryError } from 'mysql2'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

import Company from '../Entities/Company'
import Employee from '../Entities/Employee'
import EmployeeAttendance from '../Entities/EmployeeAttendance'
import EmployeeAttendanceSession from '../Entities/EmployeeAttendanceSessions'
import EmployeeLeave from '../Entities/EmployeeLeave'
import Holiday from '../Entities/Holiday'
import IdParams, { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError, dbgErrOpt } from '../configs'
import AppDataSource from '../configs/db'
import env from '../configs/env'
import { foreignKeyError } from '../utils/dbHelpers'
import { createDebug } from '../utils/debug'
import {
  BEGIN_DATE,
  END_DATE,
  SETTINGS,
  capitalizeDelim,
  crossDayToSingleDayTime,
  dateToString,
  dateToTime,
  getWorkingDayStartDate,
  isCrossDayTime,
  singleDayToCrossDayTime,
  stringToDate,
  timeToDate
} from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, CONFLICT, UNAUTHORIZED } = statusCodes
const { _params, _queries } = SITEMAP.attendances

async function processAttendance(
  employee: Employee,
  attendance: EmployeeAttendance
) {
  const isHoliday = await AppDataSource.getRepository(Holiday).existsBy({
    date: attendance.date
  })
  const officeStartTime = timeToDate(employee.officeStartTime).getTime()
  const officeEndTime = timeToDate(employee.officeEndTime).getTime()
  attendance.late = 0
  attendance.overtime = 0
  attendance.totalTime = 0
  attendance.sessions.forEach((session, i) => {
    const arrivalTime = timeToDate(session.arrivalTime).getTime()
    const leaveTime = session.leaveTime
      ? timeToDate(session.leaveTime).getTime()
      : undefined
    const sessionTime = leaveTime
      ? Math.ceil((leaveTime - arrivalTime) / 60000)
      : 0

    if (!session.sessionTime) session.sessionTime = sessionTime

    attendance.totalTime += sessionTime

    // FIXME: find all the intervals after start and add to late
    if (!i)
      attendance.late = Math.max(
        0,
        Math.ceil((arrivalTime - officeStartTime) / 60000) -
          (parseInt(SETTINGS.ATTENDANCE_ENTRY_GRACE_PERIOD) || 0)
      )
    // FIXME: find all the intervals after end and add to overtime
    if (i === attendance.sessions.length - 1)
      attendance.overtime = Math.max(
        0,
        (isHoliday
          ? attendance.totalTime
          : leaveTime
          ? Math.ceil((leaveTime - officeEndTime) / 60000)
          : 0) - (parseInt(SETTINGS.ATTENDANCE_LEAVE_GRACE_PERIOD) || 0)
      )
  })

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
      relations: { attendances: true },
      order: { attendances: { date: 'asc', sessions: { arrivalTime: 'ASC' } } }
    })
    if (!employeeAttendance)
      throw new ResponseError('No Employee with criteria', NOT_FOUND)

    res.json(employeeAttendance)
  } catch (err) {
    next(err)
  }
}

class StatusParams {
  @IsDateString()
  @IsNotEmpty()
  date!: string
}

export const employeeCurrentStatus: RequestHandler<
  {},
  { message: 'PRESENT' | 'BREAK' },
  {},
  Partial<StatusParams>
> = async (req, res, next) => {
  try {
    const { date } = await transformAndValidate(StatusParams, req.query)
    const attendancesToday = await AppDataSource.manager.findOne(
      EmployeeAttendance,
      {
        where: { employee: { id: req.user?.employeeId }, date },
        order: { sessions: { arrivalTime: 'desc' } }
      }
    )
    if (
      attendancesToday?.sessions[0] &&
      !attendancesToday.sessions[0].leaveTime
    ) {
      res.json({ message: 'PRESENT' })
      return
    }

    res.json({ message: 'BREAK' })
  } catch (err) {
    next(err)
  }
}

class TimesheetBody {
  @IsDateString()
  @IsNotEmpty()
  date!: string

  @Matches(/\d{2}:\d{2}/i, { message: 'Bad Time' })
  @IsNotEmpty()
  time!: string
}

export const addBreak: RequestHandler<
  {},
  { message: string },
  TimesheetBody
> = async (req, res, next) => {
  // TODO: validate in routes
  if (!req.user?.employeeId) {
    res.status(UNAUTHORIZED).json({ message: 'Not an employee' })
    return
  }
  try {
    const { date, time } = await transformAndValidate(TimesheetBody, req.body)

    const employee = await AppDataSource.manager.findOne(Employee, {
      where: { id: req.user.employeeId }
    })
    if (!employee) throw new ResponseError('Invalid employee', NOT_FOUND)
    // TODO: validate req.body
    // TODO: check conflicting range
    const attendance = await AppDataSource.manager.findOne(EmployeeAttendance, {
      where: { employee: { id: req.user?.employeeId }, date },
      order: { sessions: { arrivalTime: 'desc' } },
      relations: { employee: true }
    })

    const lastSession = attendance?.sessions[0]
    if (!lastSession) {
      res.status(CONFLICT).json({ message: 'Already in break' })
      return
    }
    if (lastSession.leaveTime) {
      res.status(CONFLICT).json({ message: 'Already in break' })
      return
    }
    lastSession.leaveTime = time
    processAttendance(employee, attendance)
    await transformAndValidate(EmployeeAttendance, attendance)
    await AppDataSource.manager.save(
      EmployeeAttendance,
      attendance satisfies EmployeeAttendance
    )

    res.json({ message: 'Attendance status changed to break' })
  } catch (err) {
    next(err)
  }
}

export const addResume: RequestHandler<
  {},
  { message: string },
  TimesheetBody
> = async (req, res, next) => {
  if (!req.user?.employeeId) {
    res.status(UNAUTHORIZED).json({ message: 'Not an employee' })
    return
  }
  try {
    const { date, time } = await transformAndValidate(TimesheetBody, req.body)

    const employee = await AppDataSource.manager.findOne(Employee, {
      where: { id: req.user.employeeId }
    })
    if (!employee) throw new ResponseError('Invalid employee', NOT_FOUND)
    const attendance = await AppDataSource.manager.findOne(EmployeeAttendance, {
      where: { employee: { id: req.user.employeeId }, date },
      order: { sessions: { arrivalTime: 'desc' } },
      relations: { employee: true }
    })
    const lastSession = attendance?.sessions[0]
    const newSession = await transformAndValidate(EmployeeAttendanceSession, {
      id: -1,
      arrivalTime: time,
      sessionTime: 0,
      attendance: { id: -1 } as EmployeeAttendance
    })
    // TODO: check conflicting range
    if (lastSession) {
      if (!lastSession.leaveTime) {
        res.status(CONFLICT).json({ message: 'Already working' })
        return
      }

      attendance.sessions = [...attendance.sessions, newSession]
      processAttendance(employee, attendance)
      await AppDataSource.manager.save(EmployeeAttendance, attendance)
    } else if (attendance) {
      attendance.sessions = [newSession]
      processAttendance(employee, attendance)
      await AppDataSource.manager.save(EmployeeAttendance, attendance)
    } else {
      const newAttendance = await transformAndValidate(EmployeeAttendance, {
        id: -1,
        date,
        late: 0,
        overtime: 0,
        totalTime: 0,
        sessions: [newSession],
        employee
      } satisfies EmployeeAttendance)
      newAttendance.employee.id = employee.id
      processAttendance(employee, newAttendance)
      await AppDataSource.manager.save(EmployeeAttendance, newAttendance)
    }

    // TODO: validate other holidays stuff
    res.json({ message: 'Attendance status changed to working' })
  } catch (err) {
    next(err)
  }
}

interface AttendanceInput {
  entryDate: string
  arrivalTime: string
  leaveTime?: string
  employee: { dayStartTime: string }
}

function getCrossDayAttendance(input: AttendanceInput) {
  const {
    entryDate: entryDateString,
    arrivalTime,
    employee: { dayStartTime }
  } = input
  let { leaveTime } = input

  let leaveDateString: undefined | string
  if (leaveTime) {
    if (arrivalTime > leaveTime || isCrossDayTime(leaveTime)) {
      const newDate = stringToDate(entryDateString)
      newDate.setDate(newDate.getDate() + 1)
      leaveDateString = dateToString(newDate)
    } else leaveDateString = entryDateString

    if (isCrossDayTime(leaveTime))
      leaveTime = crossDayToSingleDayTime(leaveTime)
  }

  const entryTimeDate = stringToDate(entryDateString, arrivalTime)
  const leaveTimeDate = leaveDateString
    ? stringToDate(leaveDateString, leaveTime)
    : undefined

  type Segment = { date: string; start: string; end?: string }
  const segments: Segment[] = []

  let currentWorkingStartDate = getWorkingDayStartDate(
    entryTimeDate,
    dayStartTime
  )

  while (currentWorkingStartDate < (leaveTimeDate || entryTimeDate)) {
    const nextWorkingStartDate = new Date(currentWorkingStartDate)
    nextWorkingStartDate.setDate(currentWorkingStartDate.getDate() + 1)

    const segmentStartDate = new Date(
      Math.max(currentWorkingStartDate.getTime(), entryTimeDate.getTime())
    )
    let segmentEndDate: Date | undefined
    if (leaveTimeDate)
      segmentEndDate = new Date(
        Math.min(
          nextWorkingStartDate.getTime() - 60000,
          leaveTimeDate.getTime()
        )
      )

    if (!segmentEndDate || segmentStartDate < segmentEndDate) {
      const currentWorkingDateString = dateToString(currentWorkingStartDate)

      segments.push({
        date: currentWorkingDateString,
        start:
          dateToString(segmentStartDate) > currentWorkingDateString
            ? singleDayToCrossDayTime(dateToTime(segmentStartDate))
            : dateToTime(segmentStartDate),
        end: segmentEndDate
          ? dateToString(segmentEndDate) > currentWorkingDateString
            ? singleDayToCrossDayTime(dateToTime(segmentEndDate))
            : dateToTime(segmentEndDate)
          : undefined
      })
    }

    currentWorkingStartDate = nextWorkingStartDate
  }

  return segments
}

const debugError = createDebug('controller:attendance', dbgErrOpt)

export const addEmployeeAttendance: RequestHandler<
  {},
  { message: string; data?: { error?: string }[] },
  EmployeeAttendance[]
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  const currentDate = new Date() // TODO: 2 day buffer
  try {
    await queryRunner.connect()
    await queryRunner.startTransaction()

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
        if (req.body[i]?.employee.id)
          attendance.employee.id = req.body[i]!.employee.id

        if (!attendance.sessions[0]) {
          data.push({ error: 'Cannot add attendance without session data' })
          continue
        }
        attendance.sessions.forEach(
          session => (session.attendance = attendance)
        )

        if (stringToDate(attendance.date) > currentDate) {
          data.push({ error: 'Cannot add attendance in future date' })
          continue
        }

        const employee = await queryRunner.manager.findOneBy(Employee, {
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

        const paidLeaveExists = await queryRunner.manager.existsBy(
          EmployeeLeave,
          {
            type: 'paid',
            duration: 'fullday',
            employee: { id: attendance.employee.id },
            from: LessThanOrEqual(attendance.date),
            to: MoreThanOrEqual(attendance.date)
          }
        )
        if (paidLeaveExists) {
          data.push({
            error: 'Fullday Paid leave already exists at the same date'
          })
          continue
        }

        const isHoliday = await AppDataSource.getRepository(Holiday).existsBy({
          date: attendance.date
        })
        if (!employee.overtimeBonusPerMinute && isHoliday) {
          data.push({ error: 'Employee overtime not applicable at holiday' })
          continue
        }

        let alreadyExists = false

        for (const { arrivalTime, leaveTime } of attendance.sessions) {
          const crossDayAttendance = getCrossDayAttendance({
            arrivalTime,
            leaveTime,
            entryDate: attendance.date,
            employee
          })

          for (const { date, start, end } of crossDayAttendance) {
            alreadyExists = await queryRunner.manager.existsBy(Employee, {
              id: attendance.employee.id,
              attendances: [
                {
                  date,
                  sessions: {
                    arrivalTime: And(
                      MoreThanOrEqual(start),
                      LessThanOrEqual(
                        end || singleDayToCrossDayTime(employee.dayStartTime) // TODO: -1 minute  // TODO: replace all 23:59
                      )
                    )
                  }
                },
                {
                  date,
                  sessions: {
                    leaveTime: And(
                      MoreThanOrEqual(start),
                      LessThanOrEqual(
                        end || singleDayToCrossDayTime(employee.dayStartTime)
                      )
                    )
                  }
                }
              ]
            })
            if (alreadyExists) break
          }
          if (alreadyExists) break
        }

        if (alreadyExists) {
          data.push({
            error: 'Attendance entry already exists at the same date and time'
          })
          continue
        }

        for (const { arrivalTime, leaveTime } of attendance.sessions) {
          const crossDayAttendance = getCrossDayAttendance({
            arrivalTime,
            leaveTime,
            entryDate: attendance.date,
            employee
          })

          for (const { date, start, end } of crossDayAttendance) {
            const attendance =
              (await queryRunner.manager.findOneBy(EmployeeAttendance, {
                date,
                employee
              })) ||
              (await transformAndValidate(EmployeeAttendance, {
                id: -1,
                date,
                employee,
                late: 0,
                overtime: 0,
                totalTime: 0,
                sessions: []
              }))
            const newSession: EmployeeAttendanceSession =
              await transformAndValidate(EmployeeAttendanceSession, {
                id: -1,
                arrivalTime: start,
                leaveTime: end,
                attendance,
                sessionTime: 0
              })
            attendance.sessions = [...attendance.sessions, newSession]
            await processAttendance(employee, attendance)
            await queryRunner.manager.save(EmployeeAttendance, attendance)
          }
        }
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

    await queryRunner.commitTransaction()
    res.status(CREATED).json({ message: 'Attendance Processed', data })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
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

    attendance.id = previousAttendance.id
    attendance.employee.id = previousAttendance.employee.id
    await AppDataSource.manager.save(EmployeeAttendance, attendance)

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
