import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addDepartment,
  allDepartments,
  departmentDetails,
  updateDepartment
} from '../../departments'
import { departments as sitemap } from '../SITEMAP'

const departmentsRouter = express.Router()
departmentsRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
departmentsRouter.get(sitemap.get, allDepartments)
departmentsRouter.get(sitemap.getById, departmentDetails)
departmentsRouter.post(sitemap.post, addDepartment)
departmentsRouter.put(sitemap.put, updateDepartment)

export default departmentsRouter
