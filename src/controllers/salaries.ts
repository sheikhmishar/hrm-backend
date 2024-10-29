import type { RequestHandler } from 'express'

import Employee from '../Entities/Employee'
import { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { NOT_FOUND } = statusCodes
const { _params } = SITEMAP.salaries

export const employeeSalaryDetails: RequestHandler<
  Partial<typeof _params>,
  Employee,
  {}
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

    const employeeSalary = await AppDataSource.getRepository(Employee).findOne({
      where: { id: employeeId },
      relations: { salaries: true }
    })
    if (!employeeSalary)
      throw new ResponseError('No Employee with criteria', NOT_FOUND)
    res.json(employeeSalary)
  } catch (err) {
    next(err)
  }
}
