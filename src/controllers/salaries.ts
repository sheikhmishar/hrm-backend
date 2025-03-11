import type { RequestHandler } from 'express'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Employee from '../Entities/Employee'
import EmployeeSalary from '../Entities/EmployeeSalary'
import { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { BEGIN_DATE, END_DATE, stringToDate } from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { NOT_FOUND } = statusCodes
const { _params, _queries } = SITEMAP.salaries

export const allSalaryDetails: RequestHandler<
  Partial<typeof _params>,
  Employee[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    res.json(
      await AppDataSource.getRepository(Employee).find({
        where: {
          salaries: {
            changedAt: And(
              MoreThanOrEqual(
                stringToDate((req.query.from || BEGIN_DATE) as string)
              ),
              LessThanOrEqual(stringToDate((req.query.to || END_DATE) as string))
            )
          },
          dateOfJoining: LessThanOrEqual((req.query.to || END_DATE) as string)
        },
        relations: { salaries: true }
      })
    )
  } catch (err) {
    next(err)
  }
}

export const employeeSalaryDetails: RequestHandler<
  Partial<typeof _params>,
  EmployeeSalary[],
  {}
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

    // TODO: || [] or remove No Salary Found
    const employeeSalaries = await AppDataSource.getRepository(
      EmployeeSalary
    ).find({ where: { employee: { id: employeeId } } })
    if (!employeeSalaries.length)
      throw new ResponseError('No Salary Found', NOT_FOUND)

    res.json(employeeSalaries)
  } catch (err) {
    next(err)
  }
}
