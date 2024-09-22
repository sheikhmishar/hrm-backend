import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addEmployeeAttendance,
  allEmployeeAttendances,
  employeeAttendanceDetails,
  updateEmployeeAttendance
} from '../../attendances'
import { attendances as sitemap } from '../SITEMAP'

const attendancesRouter = express.Router()
attendancesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
attendancesRouter.get(sitemap.get, allEmployeeAttendances)
attendancesRouter.get(sitemap.getByEmployeeId, employeeAttendanceDetails)
attendancesRouter.post(sitemap.post, addEmployeeAttendance)
attendancesRouter.put(sitemap.put, updateEmployeeAttendance)

export default attendancesRouter
