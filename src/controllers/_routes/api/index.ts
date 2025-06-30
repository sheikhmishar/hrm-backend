import express from 'express'

import env from '../../../configs/env'
import { seed } from '../../seeds'
import { seedEmployees } from '../../seeds/employees'
import SITEMAP from '../SITEMAP'
import attendancesRouter from './attendances'
import bonusTypesRouter from './bonus-types'
import branchesRouter from './branches'
import companiesRouter from './companies'
import deductionTypesRouter from './deduction-types'
import departmentsRouter from './departments'
import designationsRouter from './designations'
import dutyTypesRouter from './duty-types'
import employeesRouter from './employees'
import holidaysRouter from './holidays'
import leavesRouter from './leaves'
import loansRouter from './loans'
import monthlySalariesRouter from './monthly-salaries'
import salariesRouter from './salaries'
import salaryTypesRouter from './salary-types'
import settingsRouter from './settings'
import usersRouter from './users'

const router = express.Router()

if (!env.production) {
  router.get(SITEMAP.seed!, seed)
  router.get(SITEMAP.seedEmployees!, seedEmployees)
}
router.use(usersRouter)
router.use(employeesRouter)
router.use(companiesRouter)
router.use(attendancesRouter)
router.use(leavesRouter)
router.use(loansRouter)
router.use(holidaysRouter)
router.use(salariesRouter)
router.use(branchesRouter)
router.use(departmentsRouter)
router.use(designationsRouter)
router.use(monthlySalariesRouter)
router.use(dutyTypesRouter)
router.use(bonusTypesRouter)
router.use(deductionTypesRouter)
router.use(salaryTypesRouter)
router.use(settingsRouter)

export default router
