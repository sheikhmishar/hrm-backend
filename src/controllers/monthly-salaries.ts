import { IsDateString, IsNotEmpty } from 'class-validator'
import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Company from '../Entities/Company'
import Employee from '../Entities/Employee'
import EmployeeAttendance from '../Entities/EmployeeAttendance'
import EmployeeLeave from '../Entities/EmployeeLeave'
import Holiday from '../Entities/Holiday'
import MonthlySalary from '../Entities/MonthlySalary'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import {
  BEGIN_DATE,
  dayDifference,
  generateCalender,
  stringToDate
} from '../utils/misc'
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

export const allCompaniesMonthlySalaries: RequestHandler<
  {},
  (Company & { salaries: MonthlySalary[] })[],
  {},
  Partial<typeof _queries>
> = async (req, res, next) => {
  try {
    const monthlySalaries = await AppDataSource.getRepository(
      MonthlySalary
    ).find({
      where: {
        monthStartDate: req.query.monthStartDate || BEGIN_DATE,
        status: 'Paid'
      },
      relations: { employee: { company: true } }
    })

    res.json(
      (await AppDataSource.getRepository(Company).find()).map(company => ({
        ...company,
        salaries: monthlySalaries.filter(
          monthlySalary => monthlySalary.employee.company.id === company.id
        )
      }))
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

// TODO: total day calculation starts from max(joining date, start of month)
// TODO: total day calculation end at min(last day, end  of month)
// TODO: salary generate only for joined employees
export const generateMonthlySalary: RequestHandler<
  {},
  { message: string },
  Partial<SalaryGenerateBody>
> = async (req, res, next) => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const currentDate = new Date()

    const { startDate, endDate } = await transformAndValidate(
      SalaryGenerateBody,
      req.body
    )
    const fromDate = stringToDate(startDate)
    const toDate = stringToDate(endDate)

    const daysTillToday = generateCalender(fromDate, toDate).filter(
      ({ month, date }) =>
        stringToDate(
          `${
            month === '01' ? toDate.getFullYear() : fromDate.getFullYear()
          }-${month}-${date}`
        ) <= currentDate
    ).length // TODO: math

    // TODO: await to Promise all

    const [attendances, leaves, activeEmployees, holidays] = await Promise.all([
      queryRunner.manager.getRepository(EmployeeAttendance).find({
        where: {
          date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
          employee: {
            dateOfJoining: LessThanOrEqual(endDate),
            status: 'active'
          }
        },
        relations: { employee: true }
      }),
      queryRunner.manager.getRepository(EmployeeLeave).find({
        where: [
          {
            from: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
            employee: {
              dateOfJoining: LessThanOrEqual(endDate),
              status: 'active'
            }
          },
          {
            to: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
            employee: {
              dateOfJoining: LessThanOrEqual(endDate),
              status: 'active'
            }
          }
        ],
        relations: { employee: true }
      }),
      queryRunner.manager.getRepository(Employee).find({
        where: { dateOfJoining: LessThanOrEqual(endDate), status: 'active' },
        order: { id: 'DESC' }
      }),
      queryRunner.manager.getRepository(Holiday).findBy({
        date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate))
      })
    ])

    const holidaysAfterToday = holidays.filter(
      ({ date }) => stringToDate(date) > currentDate
    ).length

    const employees = activeEmployees.map(employee =>
      Object.assign(employee, {
        attendances: attendances.filter(
          ({ employee: { id } }) => employee.id === id
        ),
        leaves: leaves.filter(({ employee: { id } }) => employee.id === id)
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
          absenseDeductionPerDay,
          lateDeductionPerMinute,
          overtimeBonusPerMinute,
          totalSalary
        } = employee

        const paidLeaves = leaves.filter(({ type }) => type === 'paid')
        const unpaidLeaves = leaves.filter(({ type }) => type === 'unpaid')

        const paidLeavesAfterToday = paidLeaves.reduce(
          (total, { from, to, duration }) => {
            const fromDate = new Date(from)
            const toDate = new Date(to)

            return (
              total +
              (currentDate < fromDate && currentDate < toDate
                ? dayDifference(fromDate, toDate)
                : currentDate > toDate
                ? 0
                : dayDifference(currentDate, toDate)) *
                (duration === 'fullday' ? 1 : 0.5)
            )
          },
          0
        )

        const totalDays =
          daysTillToday + holidaysAfterToday + paidLeavesAfterToday

        const presentWithNoHolidayOrFullPaidLeave = attendances.reduce(
          (total, attendance) => {
            const date = stringToDate(attendance.date)

            const paidLeave = paidLeaves.find(
              ({ from, to }) =>
                stringToDate(from) <= date && date <= stringToDate(to)
            )
            return (
              total +
              (holidays.find(({ date }) => date === attendance.date)
                ? 0
                : paidLeave
                ? paidLeave.duration === 'fullday'
                  ? 0
                  : 0.5
                : 1)
            )
          },
          0
        )

        const paidLeavesTotal = paidLeaves.reduce(
          (total, { totalDays }) => total + totalDays,
          0
        )

        const unpaidLeavesTotal = unpaidLeaves.reduce(
          (total, { totalDays }) => total + totalDays,
          0
        )

        const absence = Math.max(
          0,
          totalDays -
            presentWithNoHolidayOrFullPaidLeave -
            holidays.length -
            paidLeavesTotal -
            unpaidLeavesTotal
        )

        const late = attendances
          .filter(attendance => attendance.late > 0)
          .reduce((total, attendance) => total + attendance.late, 0)

        const overtime = attendances
          .filter(attendance => attendance.overtime > 0)
          .reduce((total, attendance) => total + attendance.overtime, 0)

        const monthlySalary = await transformAndValidate(MonthlySalary, {
          id: -1,
          basicSalary,
          conveyance,
          foodCost,
          houseRent,
          medicalCost,
          late,
          unitLateDeduction: lateDeductionPerMinute,
          lateDeduction: 0,
          leave: unpaidLeavesTotal,
          absence,
          unitAbsenceDeduction: absenseDeductionPerDay,
          absenceDeduction: 0,
          leaveDeduction: 0,
          penalty: 0,
          overtime,
          unitOvertimePayment: overtimeBonusPerMinute,
          overtimePayment: 0,
          leaveEncashment: 0,
          bonus: 0,
          loanDeduction: 0,
          totalSalary,
          paymentMethod: 'Cash',
          monthStartDate: startDate,
          status: 'Unpaid',
          paidAt: currentDate,
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
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    const { start_date } = await transformAndValidate(
      SalaryWithdrawBody,
      req.params
    )

    await queryRunner.connect()
    await queryRunner.startTransaction()
    // TODO: transaction remove loan payments from profile
    await Promise.all(
      (
        await queryRunner.manager.getRepository(MonthlySalary).findBy({
          monthStartDate: start_date
        })
      ).map(({ employee: { id }, loanDeduction }) =>
        queryRunner.manager
          .getRepository(Employee)
          .increment(
            { id } satisfies Partial<Employee>,
            'loanRemaining' satisfies keyof Employee,
            loanDeduction
          )
      )
    )

    await queryRunner.manager.getRepository(MonthlySalary).delete({
      monthStartDate: start_date
    })
    await queryRunner.commitTransaction()

    res.status(CREATED).json({
      message:
        'Successfully Withdrawn Monthly Salary for ' +
        start_date.substring(0, 7)
    })
  } catch (err) {
    await queryRunner.rollbackTransaction()
    next(err)
  } finally {
    await queryRunner.release()
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

    const decrementResult = await queryRunner.manager.decrement(
      Employee,
      { id: previousMonthlySalary!.employee.id } satisfies Partial<Employee>,
      'loanRemaining' satisfies keyof Employee,
      monthlySalary.loanDeduction - previousMonthlySalary!.loanDeduction
    ) // TODO: loanDeduction > 0 and loanRemaining > 0
    if (!decrementResult.affected)
      throw new ResponseError('Loan Update Error', NOT_MODIFIED)

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
