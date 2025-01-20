import type { RequestHandler } from 'express'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Employee from '../Entities/Employee'
import EmployeeLeave from '../Entities/EmployeeLeave'
import Holiday from '../Entities/Holiday'
import IdParams, { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import {
  BEGIN_DATE,
  END_DATE,
  dateToString,
  dayDifference,
  getDateRange,
  getYearRange,
  stringToDate
} from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, CONFLICT } = statusCodes
const { _params, _queries } = SITEMAP.leaves

export const allEmployeeLeaves: RequestHandler<
  {},
  Employee[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    res.json(
      await AppDataSource.getRepository(Employee).find({
        relations: { leaves: true },
        where: [
          {
            leaves: {
              from: And(
                MoreThanOrEqual(req.query.from || BEGIN_DATE),
                LessThanOrEqual(req.query.to || END_DATE)
              )
            }
          },
          {
            leaves: {
              to: And(
                MoreThanOrEqual(req.query.from || BEGIN_DATE),
                LessThanOrEqual(req.query.to || END_DATE)
              )
            }
          }
        ]
      })
    )
  } catch (err) {
    next(err)
  }
}

export const employeeLeaveDetails: RequestHandler<
  Partial<typeof _params>,
  { employeePaidLeaveInYear: number; employeeLeave?: Employee | null },
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

    const year = parseInt(req.query.from || END_DATE) // TODO: validate isNaN
    const yearStart = `${year}-01-15`
    const yearEnd = `${year + 1}-01-14`

    const employeeLeave = await AppDataSource.getRepository(Employee).findOne({
      where: [
        {
          id: employeeId,
          leaves: {
            from: And(
              MoreThanOrEqual(req.query.from || BEGIN_DATE),
              LessThanOrEqual(req.query.to || END_DATE)
            )
          }
        },
        {
          id: employeeId,
          leaves: {
            to: And(
              MoreThanOrEqual(req.query.from || BEGIN_DATE),
              LessThanOrEqual(req.query.to || END_DATE)
            )
          }
        }
      ],
      relations: { leaves: true }
    })
    const employeePaidLeaveInYear =
      (
        await AppDataSource.getRepository(Employee).findOne({
          where: [
            {
              id: employeeId,
              leaves: {
                type: 'paid',
                from: And(MoreThanOrEqual(yearStart), LessThanOrEqual(yearEnd))
              }
            },
            {
              id: employeeId,
              leaves: {
                type: 'paid',
                to: And(MoreThanOrEqual(yearStart), LessThanOrEqual(yearEnd))
              }
            }
          ],
          relations: { leaves: true }
        })
      )?.leaves.reduce((total, leave) => total + leave.totalDays, 0) || 0

    res.json({ employeePaidLeaveInYear, employeeLeave })
  } catch (err) {
    next(err)
  }
}

export const addEmployeeLeave: RequestHandler<
  {},
  { message: string; data: EmployeeLeave },
  Partial<EmployeeLeave>,
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const leave = await transformAndValidate(EmployeeLeave, req.body)
    const leaveFrom = stringToDate(leave.from)
    leave.totalDays =
      dayDifference(leaveFrom, stringToDate(leave.to)) *
      (leave.duration === 'fullday' ? 1 : 0.5)
    if (req.body.employee?.id) leave.employee.id = req.body.employee.id

    if (leave.type === 'paid') {
      const [yearStart, yearEnd] = getYearRange(leaveFrom)

      const [monthStart, monthEnd] = getDateRange(leaveFrom).map(
        dateToString
      ) as [string, string]

      const [employeePaidLeaveInMonth, employeePaidLeaveInYear] =
        await Promise.all([
          AppDataSource.getRepository(EmployeeLeave)
            .findBy([
              {
                employee: { id: leave.employee.id },
                type: 'paid',
                from: And(
                  MoreThanOrEqual(monthStart),
                  LessThanOrEqual(monthEnd)
                )
              },
              {
                employee: { id: leave.employee.id },
                type: 'paid',
                to: And(MoreThanOrEqual(monthStart), LessThanOrEqual(monthEnd))
              }
            ])
            .then(leaves =>
              leaves.reduce((total, { totalDays }) => total + totalDays, 0)
            ),

          (
            await AppDataSource.getRepository(EmployeeLeave).findBy([
              {
                employee: { id: leave.employee.id },
                type: 'paid',
                from: And(MoreThanOrEqual(yearStart), LessThanOrEqual(yearEnd))
              },
              {
                employee: { id: leave.employee.id },
                type: 'paid',
                to: And(MoreThanOrEqual(yearStart), LessThanOrEqual(yearEnd))
              }
            ])
          ).reduce((total, { totalDays }) => total + totalDays, 0)
        ])

      if (leave.totalDays + employeePaidLeaveInMonth > 3)
        throw new ResponseError(`Monthly quota exceeded: ${leave.totalDays} + ${employeePaidLeaveInMonth} > ${3}`, CONFLICT)

      if (leave.totalDays + employeePaidLeaveInYear > 13)
        // TODO: 13 const
        throw new ResponseError(`Yearly quota full ${leave.totalDays} + ${employeePaidLeaveInYear} > ${13}`, CONFLICT)
    }

    const [overlappingLeaves, overlappedHolidays] = await Promise.all([
      AppDataSource.getRepository(EmployeeLeave).countBy([
        {
          employee: { id: leave.employee.id },
          from: And(MoreThanOrEqual(leave.from), LessThanOrEqual(leave.to))
        },
        {
          employee: { id: leave.employee.id },
          to: And(MoreThanOrEqual(leave.from), LessThanOrEqual(leave.to))
        }
      ]),

      AppDataSource.getRepository(Holiday).countBy({
        date: And(MoreThanOrEqual(leave.from), LessThanOrEqual(leave.to))
      })
    ])

    if (overlappingLeaves)
      throw new ResponseError('Entry already exists', CONFLICT)
    if (overlappedHolidays)
      throw new ResponseError('Holiday Exists on same date', CONFLICT)

    await AppDataSource.manager.insert(EmployeeLeave, leave)

    res
      .status(CREATED)
      .json({ message: 'Successfully Added Leave Entry', data: leave })
  } catch (err) {
    next(err)
  }
}

export const deleteEmployeeLeave: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const result = await AppDataSource.getRepository(EmployeeLeave).delete({
      id
    })
    if (!result.affected)
      throw new ResponseError(`No Leave with ID: ${id}`, NOT_FOUND)

    res.json({ message: `Successfully deleted Leave Entry with ID: ${id}` })
  } catch (err) {
    next(err)
  }
}
