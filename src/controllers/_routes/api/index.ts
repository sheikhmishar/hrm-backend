import express from 'express'

import env from '../../../configs/env'
import { seed } from '../../seeds'
import SITEMAP from '../SITEMAP'
import attendancesRouter from './attendances'
import branchesRouter from './branches'
import companiesRouter from './companies'
import departmentsRouter from './departments'
import designationsRouter from './designations'
import dutyTypesRouter from './duty-types'
import employeesRouter from './employees'
import leavesRouter from './leaves'
import salariesRouter from './salaries'
import salaryTypesRouter from './salary-types'
import settingsRouter from './settings'
import usersRouter from './users'
import monthlySalariesRouter from './monthly-salaries'

const router = express.Router()

if (!env.production) router.get(SITEMAP.seed!, seed)
router.use(usersRouter)
router.use(employeesRouter)
router.use(companiesRouter)
router.use(attendancesRouter)
router.use(leavesRouter)
router.use(salariesRouter)
router.use(branchesRouter)
router.use(departmentsRouter)
router.use(designationsRouter)
router.use(monthlySalariesRouter)
router.use(dutyTypesRouter)
router.use(salaryTypesRouter)
router.use(settingsRouter)

export default router
