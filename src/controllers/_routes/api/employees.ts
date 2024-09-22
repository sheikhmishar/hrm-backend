import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addEmployee,
  allEmployees,
  allEmployeeAssets,
  employeeDetails,
  updateEmployee
} from '../../employees'
import { employees as sitemap } from '../SITEMAP'

const employeesRouter = express.Router()
employeesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
employeesRouter.get(sitemap.get, allEmployees)
employeesRouter.get(sitemap.getAssets, allEmployeeAssets)
employeesRouter.get(sitemap.getById, employeeDetails)
employeesRouter.post(sitemap.post, addEmployee)
employeesRouter.put(sitemap.put, updateEmployee)

export default employeesRouter
