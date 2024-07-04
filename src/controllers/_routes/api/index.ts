import express from 'express'

import env from '../../../configs/env'
import { seed } from '../../seeds'
import SITEMAP from '../SITEMAP'
import companiesRouter from './companies'
import employeesRouter from './employees'
import usersRouter from './users'

const router = express.Router()

if (!env.production) router.get(SITEMAP.seed!, seed)
router.use(usersRouter)
router.use(employeesRouter)
router.use(companiesRouter)

export default router
