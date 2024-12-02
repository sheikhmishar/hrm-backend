import bcrypt from 'bcrypt'
import type { RequestHandler } from 'express'
import faker from 'faker'
import type { ResultSetHeader } from 'mysql2'

import fs from 'fs'
import path from 'path'

import Branch from '../../Entities/Branch'
import Company from '../../Entities/Company'
import Department from '../../Entities/Department'
import Designation from '../../Entities/Designation'
import DutyType from '../../Entities/DutyType'
import Employee from '../../Entities/Employee'
import SalaryType from '../../Entities/SalaryType'
import User from '../../Entities/User'
import { dbgErrOpt, dbgInfOpt } from '../../configs'
import AppDataSource from '../../configs/db'
import { createDebug } from '../../utils/debug'
import transformAndValidate from '../../utils/transformAndValidate'

const debug = createDebug('seed', dbgInfOpt)
const debugError = createDebug('seed', dbgErrOpt)
const seedDump = path.join(__dirname, 'seed-dump.js')

const currDate = new Date()

debug('INIT')
faker.seed(256)
fs.writeFileSync(
  seedDump,
  '/* eslint-disable */\n// seed: ' + currDate.toISOString() + '\n'
)

const pretty = (obj: object) => JSON.stringify(obj, null, 2)
const appendFile = async (str: string) =>
  new Promise((res, rej) =>
    fs.writeFile(seedDump, str + '\n', { flag: 'as' }, err =>
      err ? rej(err) : res(true)
    )
  )

// TODO: add remaining

const stat = {
  userFails: 0,
  users: { Employee: [], HR: [], SuperAdmin: [] } as {
    [type in (typeof User.TYPES)[number]]: number[]
  },
  companyIds: [] as number[],
  companyFails: 0,
  branchIds: [] as number[],
  branchFails: 0,
  departmentIds: [] as number[],
  departmentFails: 0,
  designationIds: [] as number[],
  designationFails: 0,
  dutyTypeIds: [] as number[],
  dutyTypeFails: 0,
  salaryTypeIds: [] as number[],
  salaryTypeFails: 0,
  employeeIds: [] as number[],
  employeeFails: 0
}

const defaultDepartment: Department = {
  id: -1,
  name: 'something',
  status: 'active'
}
const defaultBranch: Branch = { ...defaultDepartment }
const defaultDesignation: Designation = { ...defaultDepartment }
const defaultDutyType: DutyType = { ...defaultDepartment }
const defaultSalaryType: SalaryType = { ...defaultDepartment }
const defaultCompany: Company = {
  ...defaultDepartment,
  logo: '',
  status: 'active'
}

type IdLessEntity<T extends { id: number }> = OmitKey<T, 'id'>

const PHONE_FORMAT = '+8801#########'

const seedUsers = async (count: number) => {
  const users = await AppDataSource.getRepository(User).find()
  users.forEach(({ id, type }) => stat.users[type].push(id))

  for (let i = 1; i <= count - users.length; i++) {
    const firstName = faker.name.firstName(),
      lastName = faker.name.lastName(),
      type = faker.random.arrayElement(User.TYPES)

    try {
      const user = await transformAndValidate(User, {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email(firstName, lastName),
        password: await bcrypt.hash(`${firstName} ${lastName}`, 10),
        phoneNumber: faker.phone.phoneNumber(PHONE_FORMAT),
        status: faker.random.arrayElement(User.STATUSES),
        type: faker.random.arrayElement(User.TYPES)
      } satisfies IdLessEntity<User>)

      const dbResult = await AppDataSource.getRepository(User).insert(user)
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('User ENTRY FAILED:' + user)

      stat.users[type].push(user.id)

      await appendFile(`const user_${i} = ${pretty(user)};\n`)
    } catch (error) {
      stat.userFails++
      await appendFile(`const failed_user_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
const seedCompanies = async (count: number) => {
  const companies = await AppDataSource.getRepository(Company).find()
  companies.forEach(({ id }) => stat.companyIds.push(id))

  for (let i = 1; i <= count - companies.length; i++) {
    try {
      const company = await transformAndValidate(Company, {
        name: faker.random.words(),
        status: faker.random.arrayElement(Company.STATUSES),
        logo: faker.image.business(50, 50)
      } satisfies IdLessEntity<Company>)

      const dbResult = await AppDataSource.getRepository(Company).insert(
        company
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('Company ENTRY FAILED:' + company)

      stat.companyIds.push(company.id)

      await appendFile(`const company_${i} = ${pretty(company)};\n`)
    } catch (error) {
      stat.companyFails++
      await appendFile(`const failed_company_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
const seedBranches = async (count: number) => {
  const branches = await AppDataSource.getRepository(Branch).find()
  branches.forEach(({ id }) => stat.branchIds.push(id))

  for (let i = 1; i <= count - branches.length; i++) {
    try {
      const branch = await transformAndValidate(Branch, {
        name: faker.random.words(),
        status: faker.random.arrayElement(Branch.STATUSES)
      } satisfies IdLessEntity<Branch>)

      const dbResult = await AppDataSource.getRepository(Branch).insert(branch)
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('Branch ENTRY FAILED:' + branch)

      stat.branchIds.push(branch.id)

      await appendFile(`const branch_${i} = ${pretty(branch)};\n`)
    } catch (error) {
      stat.branchFails++
      await appendFile(`const failed_branch_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
const seedDepartments = async (count: number) => {
  const departments = await AppDataSource.getRepository(Department).find()
  departments.forEach(({ id }) => stat.departmentIds.push(id))

  for (let i = 1; i <= count - departments.length; i++) {
    try {
      const department = await transformAndValidate(Department, {
        name: faker.random.words(),
        status: faker.random.arrayElement(Department.STATUSES)
      } satisfies IdLessEntity<Department>)

      const dbResult = await AppDataSource.getRepository(Department).insert(
        department
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('Department ENTRY FAILED:' + department)

      stat.departmentIds.push(department.id)

      await appendFile(`const department_${i} = ${pretty(department)};\n`)
    } catch (error) {
      stat.departmentFails++
      await appendFile(`const failed_department_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
const seedDesignations = async (count: number) => {
  const designations = await AppDataSource.getRepository(Designation).find()
  designations.forEach(({ id }) => stat.designationIds.push(id))

  for (let i = 1; i <= count - designations.length; i++) {
    try {
      const designation = await transformAndValidate(Designation, {
        name: faker.random.words(),
        status: faker.random.arrayElement(Designation.STATUSES)
      } satisfies IdLessEntity<Designation>)

      const dbResult = await AppDataSource.getRepository(Designation).insert(
        designation
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('Designation ENTRY FAILED:' + designation)

      stat.designationIds.push(designation.id)

      await appendFile(`const designation_${i} = ${pretty(designation)};\n`)
    } catch (error) {
      stat.designationFails++
      await appendFile(
        `const failed_designation_${i} = ${pretty(error as any)}`
      )
      debugError(error)
    }
  }
}
const seedDutyTypes = async (count: number) => {
  const dutyTypes = await AppDataSource.getRepository(DutyType).find()
  dutyTypes.forEach(({ id }) => stat.dutyTypeIds.push(id))

  for (let i = 1; i <= count - dutyTypes.length; i++) {
    try {
      const dutyType = await transformAndValidate(DutyType, {
        name: faker.random.words(),
        status: faker.random.arrayElement(DutyType.STATUSES)
      } satisfies IdLessEntity<DutyType>)

      const dbResult = await AppDataSource.getRepository(DutyType).insert(
        dutyType
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('DutyType ENTRY FAILED:' + dutyType)

      stat.dutyTypeIds.push(dutyType.id)

      await appendFile(`const dutyType_${i} = ${pretty(dutyType)};\n`)
    } catch (error) {
      stat.dutyTypeFails++
      await appendFile(`const failed_dutyType_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
const seedSalaryTypes = async (count: number) => {
  const salaryTypes = await AppDataSource.getRepository(SalaryType).find()
  salaryTypes.forEach(({ id }) => stat.salaryTypeIds.push(id))

  for (let i = 1; i <= count - salaryTypes.length; i++) {
    try {
      const salaryType = await transformAndValidate(SalaryType, {
        name: faker.random.words(),
        status: faker.random.arrayElement(SalaryType.STATUSES)
      } satisfies IdLessEntity<SalaryType>)

      const dbResult = await AppDataSource.getRepository(SalaryType).insert(
        salaryType
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('SalaryType ENTRY FAILED:' + salaryType)

      stat.salaryTypeIds.push(salaryType.id)

      await appendFile(`const salaryType_${i} = ${pretty(salaryType)};\n`)
    } catch (error) {
      stat.salaryTypeFails++
      await appendFile(`const failed_salaryType_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
const seedEmployees = async (count: number) => {
  const employees = await AppDataSource.getRepository(Employee).find()
  employees.forEach(({ id }) => stat.employeeIds.push(id))

  for (let i = 1; i <= count - employees.length; i++) {
    const firstName = faker.name.firstName(),
      lastName = faker.name.lastName()
    const basicSalary = faker.random.number()
    try {
      const employee = await transformAndValidate(Employee, {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email(firstName, lastName),
        phoneNumber: faker.phone.phoneNumber(PHONE_FORMAT),
        altPhoneNumber: faker.phone.phoneNumber(PHONE_FORMAT),
        fullAddress: faker.address.secondaryAddress(),
        gender: faker.random.arrayElement(Employee.GENDERS),
        createdDate: faker.date.past(),
        dateOfBirth:
          faker.date.past().toISOString().split('T')[0] || '1999-01-01',
        dateOfJoining:
          faker.date.past().toISOString().split('T')[0] || '1999-01-01',
        noticePeriod: faker.random.boolean()
          ? faker.date.future().toISOString().split('T')[0] || '2029-01-01'
          : undefined,
        officeEndTime: '11:00:00',
        officeStartTime: '06:00:00',
        checkedInLateFee: faker.random.arrayElement(Employee.APPLICABILITY),
        extraBonus: faker.random.arrayElement(Employee.APPLICABILITY),
        overtime: faker.random.arrayElement(Employee.APPLICABILITY),
        basicSalary,
        conveyance: 0,
        foodCost: 0,
        houseRent: 0,
        medicalCost: 0,
        totalSalary: basicSalary,
        photo: '',
        loanTaken: 0,
        loanRemaining: 0,
        noticePeriodRemark: '',
        taskWisePayment: faker.random.boolean()
          ? faker.random.number()
          : undefined,
        wordLimit: faker.random.boolean() ? faker.random.number() : undefined,
        status: faker.random.arrayElement(Employee.STATUSES),
        company: defaultCompany,
        branch: defaultBranch,
        department: defaultDepartment,
        designation: defaultDesignation,
        dutyType: defaultDutyType,
        salaryType: defaultSalaryType,
        assets: [],
        financials: [],
        contacts: [],
        leaves: [],
        attendances: [],
        salaries: [],
        loans: []
      } satisfies IdLessEntity<Employee>)
      employee.company.id = faker.random.arrayElement(stat.companyIds)
      employee.branch.id = faker.random.arrayElement(stat.branchIds)
      employee.department.id = faker.random.arrayElement(stat.departmentIds)
      employee.designation.id = faker.random.arrayElement(stat.designationIds)
      employee.dutyType.id = faker.random.arrayElement(stat.dutyTypeIds)
      employee.salaryType.id = faker.random.arrayElement(stat.salaryTypeIds)

      const dbResult = await AppDataSource.getRepository(Employee).insert(
        employee
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('Employee ENTRY FAILED:' + employee)

      stat.employeeIds.push(employee.id)

      await appendFile(`const employee_${i} = ${pretty(employee)};\n`)
    } catch (error) {
      stat.employeeFails++
      await appendFile(`const failed_employee_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}

export const startSeeding = async () => {
  try {
    await appendFile('// Users:')

    await seedUsers(25)
    await seedCompanies(8)
    await seedBranches(8)
    await seedDepartments(8)
    await seedDesignations(8)
    await seedDutyTypes(8)
    await seedSalaryTypes(8)
    await seedEmployees(80)

    await appendFile('')
    await appendFile('// Statistics')
    await appendFile(`const stat = ${pretty(stat)}`)

    setTimeout(() => debug('DONE'), 3000)
  } catch (error) {
    debugError(error)
  }
}

export const seed: RequestHandler = (_, res) => {
  res.json({ message: 'Started' })
  startSeeding()
}
