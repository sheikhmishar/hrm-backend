import express from 'express'
import multer from 'multer'
import path from 'path'

import { staticPath } from '../../../configs'
import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addEmployee,
  allEmployeeAssets,
  allEmployees,
  employeeDetails,
  updateEmployee
} from '../../employees'
import SITEMAP from '../SITEMAP'
import Employee from '../../../Entities/Employee'

const { employees: sitemap } = SITEMAP

const multerInstance = multer({
  dest: path.join(staticPath, 'tmp'),
  limits: {
    fileSize: 4 * 1024 * 1024,
    fields: 1,
    files: 6
  }
})
const multerFields = [
  { name: 'photo' satisfies keyof Employee, maxCount: 1 },
  { name: 'documents' satisfies keyof Employee, maxCount: 5 }
]

const employeesRouter = express.Router()
employeesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
employeesRouter.get(sitemap.get, allEmployees)
employeesRouter.get(sitemap.getAssets, allEmployeeAssets)
employeesRouter.get(sitemap.getById, employeeDetails)
employeesRouter.post(
  sitemap.post,
  multerInstance.fields(multerFields),
  addEmployee
)
employeesRouter.put(
  sitemap.put,
  multerInstance.fields(multerFields),
  updateEmployee
)

export default employeesRouter
