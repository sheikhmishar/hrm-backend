import type { RequestHandler } from 'express'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Employee from '../Entities/Employee'
import EmployeeSalary from '../Entities/EmployeeSalary'
import IdParams, { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { BEGIN_DATE, END_DATE } from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, CONFLICT } = statusCodes
const { _params, _queries } = SITEMAP.salaries

export const allEmployeeSalaries: RequestHandler<
  {},
  Employee[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    res.json(
      await AppDataSource.getRepository(Employee).find({
        relations: { salaries: true },
        where: {
          salaries: {
            month: And(
              MoreThanOrEqual(req.query.from || BEGIN_DATE),
              LessThanOrEqual(req.query.to || END_DATE)
            )
          }
        }
      })
    )
  } catch (err) {
    next(err)
  }
}

export const employeeSalaryDetails: RequestHandler<
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

    const employeeSalary = await AppDataSource.getRepository(Employee).findOne({
      where: {
        id: employeeId,
        salaries: {
          month: And(
            MoreThanOrEqual(req.query.from || BEGIN_DATE),
            LessThanOrEqual(req.query.to || END_DATE)
          )
        }
      },
      relations: { salaries: true }
    })
    if (!employeeSalary)
      throw new ResponseError('No Employee with criteria', NOT_FOUND)
    res.json(employeeSalary)
  } catch (err) {
    next(err)
  }
}

// TODO: check split if remaining quota overflows, to-from, max 25 days
export const addEmployeeSalary: RequestHandler<
  {},
  { message: string; data: EmployeeSalary },
  Partial<EmployeeSalary>,
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const salary = await transformAndValidate(EmployeeSalary, req.body)
    if (req.body.employee?.id) salary.employee.id = req.body.employee.id

    const previousSalaries = await AppDataSource.getRepository(
      EmployeeSalary
    ).findBy({ employee: { id: salary.employee.id }, month: salary.month })
    if (previousSalaries.length)
      throw new ResponseError('Entry already exists', CONFLICT)

    await AppDataSource.manager.insert(EmployeeSalary, salary)

    res
      .status(CREATED)
      .json({ message: 'Successfully Added Salary Entry', data: salary })
  } catch (err) {
    next(err)
  }
}

export const updateEmployeeSalary: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: EmployeeSalary },
  Partial<EmployeeSalary>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousSalary = await AppDataSource.getRepository(
      EmployeeSalary
    ).findOne({
      where: { id },
      relations: { employee: true }
    })
    if (!previousSalary)
      throw new ResponseError(`No Salary with ID: ${id}`, NOT_FOUND)

    const salary = await transformAndValidate(EmployeeSalary, {
      ...previousSalary,
      ...req.body
    })

    salary.employee.id = req.body.employee?.id || previousSalary.employee.id

    await AppDataSource.manager.update(EmployeeSalary, { id }, salary)

    res.json({ message: 'Salary updated', data: salary })
  } catch (err) {
    next(err)
  }
}

export const deleteEmployeeSalary: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const result = await AppDataSource.getRepository(EmployeeSalary).delete({
      id
    })
    if (!result.affected)
      throw new ResponseError(`No Salary with ID: ${id}`, NOT_FOUND)

    res.json({
      message: `Successfully deleted Salary Entry with ID: ${id}`
    })
  } catch (err) {
    next(err)
  }
}
