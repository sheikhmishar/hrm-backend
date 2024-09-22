import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addEmployeeSalary,
  allEmployeeSalaries,
  employeeSalaryDetails,
  updateEmployeeSalary,
  deleteEmployeeSalary
} from '../../salaries'
import { salaries as sitemap } from '../SITEMAP'

const salariesRouter = express.Router()
salariesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
salariesRouter.get(sitemap.get, allEmployeeSalaries)
salariesRouter.get(sitemap.getByEmployeeId, employeeSalaryDetails)
salariesRouter.post(sitemap.post, addEmployeeSalary)
salariesRouter.put(sitemap.put, updateEmployeeSalary)
salariesRouter.delete(sitemap.put, deleteEmployeeSalary)

export default salariesRouter
