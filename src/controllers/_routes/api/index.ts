import express from 'express'

import env from '../../../configs/env'
import { seed } from '../../seeds'
import SITEMAP from '../SITEMAP'
import companiesRouter from './companies'
import employeesRouter from './employees'
import usersRouter from './users'
import branchesRouter from './branches'
import departmentsRouter from './departments'
import designationsRouter from './designations'
import dutytypesRouter from './duty-types'
import salarytypesRouter from './salary-types'

const router = express.Router()

if (!env.production) router.get(SITEMAP.seed!, seed)
router.use(usersRouter)
router.use(employeesRouter)
router.use(companiesRouter)
router.use(branchesRouter)
router.use(departmentsRouter)
router.use(designationsRouter)
router.use(dutytypesRouter)
router.use(salarytypesRouter)

export default router
