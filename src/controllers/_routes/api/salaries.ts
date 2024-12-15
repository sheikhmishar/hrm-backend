import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import { employeeSalaryDetails } from '../../salaries'
import SITEMAP from '../SITEMAP'

const { salaries: sitemap } = SITEMAP

const salariesRouter = express.Router()
salariesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
salariesRouter.get(sitemap.getByEmployeeId, employeeSalaryDetails)

export default salariesRouter
