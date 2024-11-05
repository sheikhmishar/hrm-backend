import bcrypt from 'bcrypt'
import type { RequestHandler } from 'express'

import Employee from '../Entities/Employee'
import EmployeeSalary from '../Entities/EmployeeSalary'
import User from '../Entities/User'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND } = statusCodes
const { _params } = SITEMAP.employees

export const allEmployees: RequestHandler<{}, Employee[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(
      await AppDataSource.getRepository(Employee).find({
        order: { id: { direction: 'DESC' } }
      })
    )
  } catch (err) {
    next(err)
  }
}

export const allEmployeeAssets: RequestHandler<{}, Employee[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(
      (await AppDataSource.getRepository(Employee).find()).filter(
        employee => employee.assets.length
      )
    )
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
      where: { id },
      relations: { branch: true }
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
  { message: string; data: User },
  Partial<Employee>
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const employee = await transformAndValidate(Employee, req.body)
    const user = await transformAndValidate(User, {
      id: -1,
      email: employee.email,
      name: employee.name,
      password: await bcrypt.hash('DEFAULT_PASSWORD', 10),
      phoneNumber: employee.phoneNumber,
      type: 'Employee',
      employee
    } satisfies User)
    if (req.body.branch?.id) employee.branch.id = req.body.branch.id
    if (req.body.company?.id) employee.company.id = req.body.company.id
    if (req.body.department?.id) employee.department.id = req.body.department.id
    if (req.body.designation?.id)
      employee.designation.id = req.body.designation.id
    if (req.body.dutyType?.id) employee.dutyType.id = req.body.dutyType.id
    if (req.body.salaryType?.id) employee.salaryType.id = req.body.salaryType.id

    await queryRunner.manager.save(Employee, employee)
    user.employee = employee
    await queryRunner.manager.insert(User, user)

    await queryRunner.commitTransaction()

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Employee', data: user })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  }
}

export const updateEmployee: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Employee },
  Partial<Employee>
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const { id } = await transformAndValidate(IdParams, req.params)
    const previousEmployee = await queryRunner.manager
      .getRepository(Employee)
      .findOne({ where: { id } })
    if (!previousEmployee)
      throw new ResponseError(`No Employee with ID: ${id}`, NOT_FOUND)

    const employee = await transformAndValidate(Employee, {
      ...previousEmployee,
      ...req.body
    })
    employee.id = id
    employee.branch.id = req.body.branch?.id || previousEmployee.branch.id
    employee.company.id = req.body.company?.id || previousEmployee.company.id
    employee.department.id =
      req.body.department?.id || previousEmployee.department.id
    employee.designation.id =
      req.body.designation?.id || previousEmployee.designation.id
    employee.dutyType.id = req.body.dutyType?.id || previousEmployee.dutyType.id
    employee.salaryType.id =
      req.body.salaryType?.id || previousEmployee.salaryType.id

    const previousUser = await queryRunner.manager.getRepository(User).findOne({
      where: { employee: { id } }
    })
    const user = await transformAndValidate(User, {
      email: employee.email,
      name: employee.name,
      phoneNumber: employee.phoneNumber,
      password:
        previousUser?.password || (await bcrypt.hash('DEFAULT_PASSWORD', 10)),
      type: 'Employee',
      employee
    } as User)
    user.employee = employee
    if (previousUser) user.id = previousUser.id

    await queryRunner.manager.save(Employee, employee)
    await queryRunner.manager.save(User, user)

    if (
      !(
        [
          'basicSalary',
          'conveyance',
          'foodCost',
          'houseRent',
          'medicalCost',
          'taskWisePayment',
          'totalSalary'
        ] satisfies (keyof EmployeeSalary)[]
      ).every(k => previousEmployee[k] === employee[k]) ||
      previousEmployee.designation.id !== employee.designation.id
    ) {
      const salary = await transformAndValidate(EmployeeSalary, {
        id: -1,
        changedAt: new Date(),
        basicSalary: employee.basicSalary,
        conveyance: employee.conveyance,
        foodCost: employee.foodCost,
        houseRent: employee.houseRent,
        medicalCost: employee.medicalCost,
        totalSalary: employee.totalSalary,
        taskWisePayment: employee.taskWisePayment,
        wordLimit: employee.wordLimit,
        designation: employee.designation,
        employee
      } satisfies EmployeeSalary)
      salary.employee = employee
      await queryRunner.manager.insert(EmployeeSalary, salary)
    }

    await queryRunner.commitTransaction()
    res.json({ message: 'Employee updated', data: employee })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
  }
}
