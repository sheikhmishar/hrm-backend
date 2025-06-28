import type { RequestHandler } from 'express'

import fs from 'fs'
import path from 'path'

import { GetResponseType } from '../../@types/response'
import Branch from '../../Entities/Branch'
import Company from '../../Entities/Company'
import Department from '../../Entities/Department'
import Designation from '../../Entities/Designation'
import DutyType from '../../Entities/DutyType'
import Employee from '../../Entities/Employee'
import SalaryType from '../../Entities/SalaryType'
import { dbgErrOpt, dbgInfOpt } from '../../configs'
import { addBranch, allBranches } from '../../controllers/branches'
import { addCompany, allCompanies } from '../../controllers/companies'
import { addDepartment, allDepartments } from '../../controllers/departments'
import { addDesignation, allDesignations } from '../../controllers/designations'
import { addDutyType, allDutyTypes } from '../../controllers/duty-types'
import { addSalaryType } from '../../controllers/salary-types'
import { createDebug } from '../../utils/debug'
import SITEMAP from '../_routes/SITEMAP'
import { addEmployee, allEmployees } from '../employees'

import employeesData from './employeesData' // TODO: add to git

const debug = createDebug('seed', dbgInfOpt)
const debugError = createDebug('seed', dbgErrOpt)
const seedDump = path.join(__dirname, 'seed-dump.js')

const currDate = new Date()

debug('INIT')
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

const customFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch('http://localhost:5000' + input, {
    ...init,
    headers: {
      ...init?.headers,
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization':
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InRlc3QyQGdtYWlsLmNvbSIsImVtYWlsIjoidGVzdDJAZ21haWwuY29tIiwidHlwZSI6IlN1cGVyQWRtaW4iLCJpYXQiOjE3MzEzMDc4NTcwMzEsImlzcyI6ImxvY2FsaG9zdCJ9.7JVNMwm6Bftn_Isrf1s3HkI6QQVmMqJcx2N-yzl1cTc'
    }
  }).then(res => {
    if (res.ok) return res.json()
    throw res.json()
  })

const stat = {
  companies: { successful: [] as Company[], failed: [] as any[] },
  branches: { successful: [] as Branch[], failed: [] as any[] },
  departments: { successful: [] as Department[], failed: [] as any[] },
  designations: {
    successful: [] as Designation[],
    failed: [] as any[]
  },
  dutyTypes: { successful: [] as DutyType[], failed: [] as any[] },
  salaryTypes: { successful: [] as SalaryType[], failed: [] as any[] },
  employees: { successful: [] as Employee[], failed: [] as any[] }
} as const satisfies { [k: string]: { successful: any[]; failed: any[] } }

function splitGrossSalary(gross: number) {
  const basicSalary = Math.ceil((gross - 2450) / 1.5)
  return {
    foodCost: 1250,
    conveyance: 450,
    medicalCost: 750,
    basicSalary,
    houseRent: Math.ceil(basicSalary / 2)
  }
}

const importEmployees = async () => {
  const employees = (await customFetch(
    SITEMAP.employees.get
  )) as GetResponseType<typeof allEmployees>
  employees?.forEach(employee => stat.employees.successful.push(employee))

  const branches = (await customFetch(SITEMAP.branches.get)) as GetResponseType<
    typeof allBranches
  >
  branches?.forEach(branch => stat.branches.successful.push(branch))

  const companies = (await customFetch(
    SITEMAP.companies.get
  )) as GetResponseType<typeof allCompanies>
  companies?.forEach(company => stat.companies.successful.push(company))

  const departments = (await customFetch(
    SITEMAP.departments.get
  )) as GetResponseType<typeof allDepartments>
  departments?.forEach(department => stat.companies.successful.push(department))

  const designations = (await customFetch(
    SITEMAP.designations.get
  )) as GetResponseType<typeof allDesignations>
  designations?.forEach(designation =>
    stat.designations.successful.push(designation)
  )

  const dutyTypes = (await customFetch(
    SITEMAP.dutyTypes.get
  )) as GetResponseType<typeof allDutyTypes>
  dutyTypes?.forEach(dutyType => stat.dutyTypes.successful.push(dutyType))

  for (let i = 1; i <= employeesData.length; i++) {
    const employeeJson = employeesData[i]

    try {
      if (!employeeJson) throw new Error('blank employeeJSON')

      const {
        id,
        // idPrev,
        name,
        email,
        phoneNumber,
        altPhoneNumber,
        // phoneNumberPrev,
        // altPhoneNumberPrev,
        // createdDate,
        dateOfBirth,
        fullAddress,
        gender,
        dateOfJoining,
        // basicSalary,
        // medicalCost,
        // conveyance,
        // foodCost,
        // houseRent,
        // totalSalary,
        wordLimit,
        officeEndTime,
        officeStartTime,
        assets,
        contacts,
        // contactsPrev,
        financials,
        checkedInLateFee,
        extraBonus,
        taskWisePayment,
        noticePeriod,
        overtime,
        status,
        ...restJSON
      } = employeeJson
      const branch =
        stat.branches.successful.find(({ name }) => name === restJSON.branch) ||
        (await customFetch(SITEMAP.branches.post, {
          method: 'post',
          body: JSON.stringify({
            id: -1,
            name: restJSON.branch,
            status: 'active'
          } satisfies Branch)
        }).then((data: GetResponseType<typeof addBranch>) => {
          stat.branches.successful.push(data!.data)
          return data!.data
        }))!

      const company =
        stat.companies.successful.find(
          ({ name }) => name === restJSON.company
        ) ||
        (await customFetch(SITEMAP.companies.post, {
          method: 'post',
          body: JSON.stringify({
            id: -1,
            name: restJSON.company,
            status: 'active'
          } satisfies Company)
        }).then((data: GetResponseType<typeof addCompany>) => {
          stat.companies.successful.push(data!.data)
          return data!.data
        }))!

      const department =
        stat.departments.successful.find(
          ({ name }) => name === restJSON.department
        ) ||
        (await customFetch(SITEMAP.departments.post, {
          method: 'post',
          body: JSON.stringify({
            id: -1,
            name: restJSON.department,
            status: 'active'
          } satisfies Department)
        }).then((data: GetResponseType<typeof addDepartment>) => {
          stat.departments.successful.push(data!.data)
          return data!.data
        }))!

      const designation =
        stat.designations.successful.find(
          ({ name }) => name === restJSON.designation
        ) ||
        (await customFetch(SITEMAP.designations.post, {
          method: 'post',
          body: JSON.stringify({
            id: -1,
            name: restJSON.designation,
            status: 'active'
          } satisfies Designation)
        }).then((data: GetResponseType<typeof addDesignation>) => {
          stat.designations.successful.push(data!.data)
          return data!.data
        }))!

      const dutyType =
        stat.dutyTypes.successful.find(
          ({ name }) => name === restJSON.dutyType
        ) ||
        (await customFetch(SITEMAP.dutyTypes.post, {
          method: 'post',
          body: JSON.stringify({
            id: -1,
            name: restJSON.dutyType,
            status: 'active'
          } satisfies DutyType)
        }).then((data: GetResponseType<typeof addDutyType>) => {
          stat.dutyTypes.successful.push(data!.data)
          return data!.data
        }))!

      const salaryType =
        stat.salaryTypes.successful.find(
          ({ name }) => name === restJSON.salaryType
        ) ||
        (await customFetch(SITEMAP.salaryTypes.post, {
          method: 'post',
          body: JSON.stringify({
            id: -1,
            name: restJSON.salaryType,
            status: 'active'
          } satisfies SalaryType)
        }).then((data: GetResponseType<typeof addSalaryType>) => {
          stat.salaryTypes.successful.push(data!.data)
          return data!.data
        }))!

      const totalSalary = parseInt(restJSON.totalSalary)

      const { basicSalary, conveyance, foodCost, houseRent, medicalCost } =
        splitGrossSalary(totalSalary)

      const employee = {
        id: parseInt(id),
        name,
        email,
        phoneNumber,
        altPhoneNumber: altPhoneNumber || undefined,
        dateOfBirth,
        fullAddress,
        gender:
          gender === 'Female'
            ? 'Female'
            : gender === 'Male'
            ? 'Male'
            : 'Others',
        assets: assets
          ? [
              {
                name: assets,
                description: assets,
                id: -1,
                givenDate: dateOfJoining,
                returnDate: undefined,
                employee: {} as any
              }
            ]
          : [],
        dateOfJoining,
        contacts: [],
        financials: [],
        branch,
        company,
        department,
        designation,
        dutyType,
        salaryType,
        absenseDeductionPerDay: 0,
        lateDeductionPerMinute: 0,
        overtimeBonusPerMinute: 0,
        basicSalary,
        medicalCost,
        conveyance,
        foodCost,
        houseRent,
        totalSalary,
        taskWisePayment: parseInt(taskWisePayment) || undefined,
        wordLimit: parseInt(wordLimit) || undefined,
        officeEndTime,
        officeStartTime,
        attendances: [],
        createdDate: new Date(),
        leaves: [],
        loans: [],
        documents: [],
        loanRemaining: 0,
        loanTaken: 0,
        salaries: [],
        status: status === 'active' ? 'active' : 'inactive',
        noticePeriod: noticePeriod || undefined,
        noticePeriodRemark: undefined,
        photo: undefined,
        forceId: 'true'
      } satisfies Employee & { forceId: string }
      const data = (await customFetch(SITEMAP.employees.post, {
        method: 'post',
        body: JSON.stringify(employee)
      })) as GetResponseType<typeof addEmployee>
      if (!data || !data.data.employee) throw new Error('Blank Response')

      stat.employees.successful.push(data.data.employee)

      await appendFile(`const employee_${i} = ${pretty(data.data)};\n`)
    } catch (error) {
      stat.employees.failed.push(employeeJson)
      await appendFile(`const failed_employee_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}
export const seedEmployees: RequestHandler = async (_, res) => {
  res.json({ message: 'Started' })
  try {
    await appendFile('// Users:')

    await importEmployees()

    await appendFile('')
    await appendFile('// Statistics')
    await appendFile(`const stat = ${pretty(stat)}`)

    setTimeout(() => debug('DONE'), 3000)
  } catch (error) {
    debugError(error)
  }
}
