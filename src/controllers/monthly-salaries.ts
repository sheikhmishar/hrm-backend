import { IsDateString, IsNotEmpty } from 'class-validator'
import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Employee from '../Entities/Employee'
import EmployeeAttendance from '../Entities/EmployeeAttendance'
import EmployeeLeave from '../Entities/EmployeeLeave'
import Holiday from '../Entities/Holiday'
import MonthlySalary from '../Entities/MonthlySalary'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { BEGIN_DATE, dayDifference, stringToDate } from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params, _queries } = SITEMAP.monthlySalaries

export const allMonthlySalaries: RequestHandler<
  {},
  MonthlySalary[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    res.json(
      await AppDataSource.getRepository(MonthlySalary).findBy({
        monthStartDate: req.query.monthStartDate || BEGIN_DATE
      })
    )
  } catch (err) {
    next(err)
  }
}

export const allSalariesByEmployee: RequestHandler<
  Partial<typeof _params>,
  MonthlySalary[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    res.json(
      await AppDataSource.getRepository(MonthlySalary).findBy({
        employee: { id: parseInt(req.params.id) || -1 }
      })
    )
  } catch (err) {
    next(err)
  }
}

export const monthlySalaryDetails: RequestHandler<
  Partial<typeof _params>,
  MonthlySalary
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const monthlySalary = await AppDataSource.getRepository(
      MonthlySalary
    ).findOneBy({ id })
    if (!monthlySalary)
      throw new ResponseError(`No Monthly Salary with ID: ${id}`, NOT_FOUND)
    res.json(monthlySalary)
  } catch (err) {
    next(err)
  }
}

class SalaryGenerateBody {
  @IsDateString()
  @IsNotEmpty()
  startDate!: string

  @IsDateString()
  @IsNotEmpty()
  endDate!: string
}

export const generateMonthlySalary: RequestHandler<
  {},
  { message: string },
  { startDate?: string; endDate?: string }
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    const { startDate, endDate } = await transformAndValidate(
      SalaryGenerateBody,
      req.body
    )

    const totalDays = dayDifference(
      stringToDate(startDate),
      stringToDate(endDate)
    )

    await queryRunner.connect()
    await queryRunner.startTransaction()

    // TODO: await to Promise all

    const [attendances, paidLeaves, allEmployees, holidayCount] =
      await Promise.all([
        queryRunner.manager.getRepository(EmployeeAttendance).find({
          where: {
            date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
            employee: { dateOfJoining: LessThanOrEqual(endDate) }
          },
          relations: { employee: true }
        }),
        queryRunner.manager.getRepository(EmployeeLeave).find({
          where: [
            {
              from: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
              type: 'paid',
              employee: { dateOfJoining: LessThanOrEqual(endDate) }
            },
            {
              to: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
              type: 'paid',
              employee: { dateOfJoining: LessThanOrEqual(endDate) }
            }
          ],
          relations: { employee: true }
        }),
        queryRunner.manager.getRepository(Employee).find({
          where: { dateOfJoining: LessThanOrEqual(endDate) },
          order: { id: 'DESC' }
        }),
        queryRunner.manager.getRepository(Holiday).countBy({
          date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate))
        })
      ])

    const employees = allEmployees.map(employee =>
      Object.assign(employee, {
        attendances: attendances.filter(
          ({ employee: { id } }) => employee.id === id
        ),
        leaves: paidLeaves.filter(({ employee: { id } }) => employee.id === id)
      } satisfies Partial<Employee>)
    )

    await Promise.all(
      employees.map(async employee => {
        const {
          attendances,
          leaves,
          basicSalary,
          conveyance,
          foodCost,
          houseRent,
          medicalCost,
          totalSalary
        } = employee

        const totalPaidLeaves = leaves.reduce(
          (total, { totalDays }) => total + totalDays,
          0
        )

        const totalHolidayAttendances = attendances.reduce(
          (total, { totalTime, overtime }) =>
            total + (totalTime === overtime ? 1 : 0),
          0
        )
        const totalLeaves =
          totalDays -
          holidayCount -
          totalPaidLeaves -
          (attendances.length - totalHolidayAttendances)

        const leaveDeduction = totalLeaves * (employee.basicSalary / totalDays)

        const late = attendances
          .filter(attendance => attendance.late > 0)
          .reduce((total, attendance) => total + attendance.late, 0)
        const lateDeduction = late * 10

        const overtime = attendances
          .filter(attendance => attendance.overtime > 0)
          .reduce((total, attendance) => total + attendance.overtime, 0)
        const overtimePayment =
          (overtime * (employee.basicSalary / 208) * 3) / 60

        const monthlySalary = await transformAndValidate(MonthlySalary, {
          id: -1,
          basicSalary,
          conveyance,
          foodCost,
          houseRent,
          medicalCost,
          late,
          lateDeduction,
          leave: totalLeaves,
          leaveDeduction,
          penalty: 0,
          overtime,
          overtimePayment,
          bonus: 0,
          loanDeduction: 0,
          totalSalary: Math.max(
            0,
            totalSalary - lateDeduction - leaveDeduction + overtimePayment
          ),
          paymentMethod: 'Cash',
          monthStartDate: startDate,
          status: 'Unpaid',
          paidAt: new Date(),
          employee
        } satisfies MonthlySalary)
        monthlySalary.employee = employee

        const insertResult = await queryRunner.manager.insert(
          MonthlySalary,
          monthlySalary
        )
        const monthlySalaryInsertResultRaw: ResultSetHeader = insertResult.raw
        if (!monthlySalaryInsertResultRaw.affectedRows)
          throw new ResponseError('Monthly Salary unchanged', NOT_MODIFIED)
      })
    )

    await queryRunner.commitTransaction()
    res.status(CREATED).json({
      message:
        'Successfully Generated Monthly Salary for ' + startDate.substring(0, 7)
    })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
  }
}

class SalaryWithdrawBody {
  @IsDateString()
  @IsNotEmpty()
  start_date!: string
}
export const withdrawMonthlySalary: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  try {
    const { start_date } = await transformAndValidate(
      SalaryWithdrawBody,
      req.params
    )

    await AppDataSource.getRepository(MonthlySalary).delete({
      monthStartDate: start_date
    })

    res.status(CREATED).json({
      message:
        'Successfully Withdrawn Monthly Salary for ' +
        start_date.substring(0, 7)
    })
  } catch (err) {
    next(err)
  }
}

export const confirmMonthlySalary: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  try {
    const { start_date } = await transformAndValidate(
      SalaryWithdrawBody,
      req.params
    )

    await AppDataSource.getRepository(MonthlySalary).update(
      { monthStartDate: start_date },
      { status: 'Paid' } satisfies Partial<MonthlySalary>
    )

    res.status(CREATED).json({
      message:
        'Successfully Paid Monthly Salary for ' + start_date.substring(0, 7)
    })
  } catch (err) {
    next(err)
  }
}

export const updateMonthlySalary: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: MonthlySalary },
  Partial<MonthlySalary>
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()

  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    await queryRunner.connect()
    await queryRunner.startTransaction()

    const previousMonthlySalary = await queryRunner.manager
      .getRepository(MonthlySalary)
      .findOne({ where: { id }, relations: { employee: true } })
    const monthlySalary = await transformAndValidate(MonthlySalary, {
      ...previousMonthlySalary,
      ...req.body
    })

    const result = await queryRunner.manager.update(
      MonthlySalary,
      { id },
      monthlySalary
    )
    if (!result.affected)
      throw new ResponseError(`No Monthly Salary with ID: ${id}`, NOT_FOUND)

    await queryRunner.manager.decrement(
      Employee,
      {
        id: previousMonthlySalary!.employee.id
      } satisfies Partial<Employee>,
      'loanRemaining' satisfies keyof Employee,
      monthlySalary.loanDeduction - previousMonthlySalary!.loanDeduction
    ) // TODO: loanDeduction > 0

    monthlySalary.id = id
    await queryRunner.commitTransaction()

    res.json({ message: 'Monthly Salary updated', data: monthlySalary })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
  }
}
