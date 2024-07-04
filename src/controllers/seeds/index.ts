import bcrypt from 'bcrypt'
import type { RequestHandler } from 'express'
import faker from 'faker'
import type { ResultSetHeader } from 'mysql2'

import fs from 'fs'
import path from 'path'

import Company from '../../Entities/Company'
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

const stat = {
  userIds: [] as number[],
  userFails: 0,
  users: { admin: [], superAdmin: [] } as {
    [type in (typeof User.TYPES)[number]]: number[]
  },
  companyIds: [] as number[],
  companyFails: 0
}

// @ts-ignore
type IdLessEntity<T extends { id: number }> = Modify<T, { id?: number }>

const PHONE_FORMAT = '+8801#########'

const seedUsers = async (count: number) => {
  const users = await AppDataSource.manager.getRepository(User).find()
  users.forEach(({ id, type }) => {
    stat.userIds.push(id)
    stat.users[type].push(id)
  })

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
        type: faker.random.arrayElement(User.TYPES)
      } satisfies IdLessEntity<User>)

      const dbResult = await AppDataSource.manager
        .getRepository(User)
        .insert(user)
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('User ENTRY FAILED:' + user)

      stat.userIds.push(dbResultRaw.insertId)
      stat.users[type].push(dbResultRaw.insertId)
      user.id = dbResultRaw.insertId

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
        name: `${faker.date.month()} ${2018 + Math.floor(i / 3)}`,
        status: faker.random.arrayElement(Company.STATUSES),
        logo: ''
      } satisfies IdLessEntity<Company>)

      const dbResult = await AppDataSource.getRepository(Company).insert(
        company
      )
      const dbResultRaw: ResultSetHeader = dbResult.raw
      if (!dbResultRaw.affectedRows)
        throw new Error('Company ENTRY FAILED:' + company)

      stat.companyIds.push(dbResultRaw.insertId)
      company.id = dbResultRaw.insertId // TODO: is the id auto fetched?

      await appendFile(`const company_${i} = ${pretty(company)};\n`)
    } catch (error) {
      stat.companyFails++
      await appendFile(`const failed_company_${i} = ${pretty(error as any)}`)
      debugError(error)
    }
  }
}

export const startSeeding = async () => {
  try {
    await appendFile('// Users:')

    await seedUsers(25)
    await seedCompanies(8)

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
