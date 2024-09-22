import type { RequestHandler } from 'express'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Employee from '../Entities/Employee'
import EmployeeLeave from '../Entities/EmployeeLeave'
import IdParams, { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { BEGIN_DATE, END_DATE } from '../utils/misc'
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
  Employee,
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

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
    if (!employeeLeave)
      throw new ResponseError('No Employee with criteria', NOT_FOUND)
    res.json(employeeLeave)
  } catch (err) {
    next(err)
  }
}

// TODO: check split if remaining quota overflows, to-from, max 25 days
export const addEmployeeLeave: RequestHandler<
  {},
  { message: string; data: EmployeeLeave },
  Partial<EmployeeLeave>,
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const leave = await transformAndValidate(EmployeeLeave, req.body)
    if (req.body.employee?.id) leave.employee.id = req.body.employee.id

    const previousLeaves = await AppDataSource.getRepository(
      EmployeeLeave
    ).findBy([
      {
        employee: { id: leave.employee.id },
        from: And(MoreThanOrEqual(leave.from), LessThanOrEqual(leave.to))
      },
      {
        employee: { id: leave.employee.id },
        to: And(MoreThanOrEqual(leave.from), LessThanOrEqual(leave.to))
      }
    ])
    if (previousLeaves.length)
      throw new ResponseError('Entry already exists', CONFLICT)

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

    res.json({
      message: `Successfully deleted Leave Entry with ID: ${id}`
    })
  } catch (err) {
    next(err)
  }
}
