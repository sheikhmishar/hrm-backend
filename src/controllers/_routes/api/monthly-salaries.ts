import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  allMonthlySalaries,
  allSalariesByEmployee,
  confirmMonthlySalary,
  generateMonthlySalary,
  monthlySalaryDetails,
  updateMonthlySalary,
  withdrawMonthlySalary
} from '../../monthly-salaries'
import { monthlySalaries as sitemap } from '../SITEMAP'

const monthlySalariesRouter = express.Router()
monthlySalariesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
monthlySalariesRouter.get(sitemap.get, allMonthlySalaries)
monthlySalariesRouter.get(sitemap.getAllByEmployeeId, allSalariesByEmployee)
monthlySalariesRouter.get(sitemap.getById, monthlySalaryDetails)
monthlySalariesRouter.post(sitemap.post, generateMonthlySalary)
monthlySalariesRouter.put(sitemap.putConfirm, confirmMonthlySalary)
monthlySalariesRouter.put(sitemap.put, updateMonthlySalary)
monthlySalariesRouter.delete(sitemap.delete, withdrawMonthlySalary)

export default monthlySalariesRouter
