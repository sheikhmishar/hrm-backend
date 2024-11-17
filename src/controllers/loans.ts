import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import Employee from '../Entities/Employee'
import Loan from '../Entities/Loan'
import IdParams, { EmployeeIdParams } from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.loans

export const allLoans: RequestHandler<{}, Employee[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(
      await AppDataSource.getRepository(Employee).find({
        relations: { loans: true }
      })
    )
  } catch (err) {
    next(err)
  }
}

export const loanByEmployee: RequestHandler<
  Partial<typeof _params>,
  Employee
> = async (req, res, next) => {
  try {
    const { employeeId } = await transformAndValidate(
      EmployeeIdParams,
      req.params
    )

    const employee = await AppDataSource.getRepository(Employee).findOne({
      where: { id: employeeId },
      relations: { loans: true }
    })
    if (!employee)
      throw new ResponseError(`No Employee with ID: ${employeeId}`, NOT_FOUND)

    res.json(employee)
  } catch (err) {
    next(err)
  }
}

export const addLoan: RequestHandler<
  {},
  { message: string; data: Loan },
  Partial<Loan>
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    const loan = await transformAndValidate(Loan, req.body)
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const insertResult = await queryRunner.manager.insert(Loan, loan)
    const departmentInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!departmentInsertResultRaw.affectedRows)
      throw new ResponseError('Loan unchanged', NOT_MODIFIED)

    const incrementTakenResult = await queryRunner.manager.increment(
      Employee,
      { id: loan.employee.id } satisfies Partial<Employee>,
      'loanTaken' satisfies keyof Employee,
      loan.amount
    )
    if (!incrementTakenResult.affected)
      throw new ResponseError('Loan unchanged', NOT_MODIFIED)

    const incrementRemainingResult = await queryRunner.manager.increment(
      Employee,
      { id: loan.employee.id } satisfies Partial<Employee>,
      'loanRemaining' satisfies keyof Employee,
      loan.amount
    )
    if (!incrementRemainingResult.affected)
      throw new ResponseError('Loan unchanged', NOT_MODIFIED)

    await queryRunner.commitTransaction()
    res
      .status(CREATED)
      .json({ message: 'Successfully Added Loan Entry', data: loan })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
  }
}

export const deleteLoan: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const loan = await queryRunner.manager
      .getRepository(Loan)
      .findOne({ where: { id }, relations: { employee: true } })
    if (!loan) throw new ResponseError(`No Loan with ID: ${id}`, NOT_FOUND)

    const decrementTakenResult = await queryRunner.manager.decrement(
      Employee,
      { id: loan.employee.id } satisfies Partial<Employee>,
      'loanTaken' satisfies keyof Employee,
      loan.amount
    )
    if (!decrementTakenResult.affected)
      throw new ResponseError('Loan unchanged', NOT_MODIFIED)

    const decrementRemainingResult = await queryRunner.manager.decrement(
      Employee,
      { id: loan.employee.id } satisfies Partial<Employee>,
      'loanRemaining' satisfies keyof Employee,
      loan.amount
    )
    if (!decrementRemainingResult.affected)
      throw new ResponseError('Loan unchanged', NOT_MODIFIED)

    const result = await queryRunner.manager
      .getRepository(Loan)
      .delete({ id } satisfies Partial<Loan>)
    if (!result.affected)
      throw new ResponseError(`Loan not deleted: ${id}`, NOT_FOUND)

    await queryRunner.commitTransaction()
    res.json({ message: `Successfully deleted Loan Entry with ID: ${id}` })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
  }
}
