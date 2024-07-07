import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import Employee from '../Entities/Employee'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.employees

export const allEmployees: RequestHandler<{}, Employee[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(Employee).find())
  } catch (err) {
    next(err)
  }
}

export const employeeDetails: RequestHandler<
  Partial<typeof _params>,
  Employee
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const employee = await AppDataSource.getRepository(Employee).findOne({
      where: { id }
    })
    if (!employee)
      throw new ResponseError(`No Employee with ID: ${id}`, NOT_FOUND)
    res.json(employee)
  } catch (err) {
    next(err)
  }
}

export const addEmployee: RequestHandler<
  {},
  { message: string; data: Employee },
  Partial<Employee>
> = async (req, res, next) => {
  try {
    const employee = await transformAndValidate(Employee, req.body)

    const insertResult = await AppDataSource.manager.insert(Employee, employee)
    const employeeInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!employeeInsertResultRaw.affectedRows)
      throw new ResponseError('Employee unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Employee', data: employee })
  } catch (err) {
    next(err)
  }
}

export const updateEmployee: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Employee },
  Partial<Employee>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousEmployee = await AppDataSource.getRepository(
      Employee
    ).findOneBy({
      id
    })
    const employee = await transformAndValidate(Employee, {
      ...previousEmployee,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      Employee,
      { id },
      employee
    )
    if (!result.affected)
      throw new ResponseError(`No Employee with ID: ${id}`, NOT_FOUND)

    employee.id = id
    res.json({ message: 'Employee updated', data: employee })
  } catch (err) {
    next(err)
  }
}
