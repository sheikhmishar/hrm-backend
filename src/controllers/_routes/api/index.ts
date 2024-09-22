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
import salaryTypesRouter from './salary-types'
import usersRouter from './users'

const router = express.Router()

if (!env.production) router.get(SITEMAP.seed!, seed)
router.use(usersRouter)
router.use(employeesRouter)
router.use(companiesRouter)
router.use(attendancesRouter)
router.use(branchesRouter)
router.use(departmentsRouter)
router.use(designationsRouter)
router.use(dutyTypesRouter)
router.use(salaryTypesRouter)

export default router
