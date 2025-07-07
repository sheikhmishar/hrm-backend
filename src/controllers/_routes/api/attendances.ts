import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addBreak,
  addEmployeeAttendance,
  addResume,
  allEmployeeAttendances,
  companyWiseAttendance,
  deleteEmployeeAttendance,
  employeeAttendanceDetails,
  employeeCurrentStatus,
  updateEmployeeAttendance
} from '../../attendances'
import SITEMAP from '../SITEMAP'

const { attendances: sitemap } = SITEMAP

const attendancesRouter = express.Router()
attendancesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
attendancesRouter.get(sitemap.get, allEmployeeAttendances)
attendancesRouter.get(sitemap.getCurrentStatus, employeeCurrentStatus)
attendancesRouter.get(sitemap.getCompanyWise, companyWiseAttendance)
attendancesRouter.get(sitemap.getByEmployeeId, employeeAttendanceDetails)
attendancesRouter.post(sitemap.post, addEmployeeAttendance)
attendancesRouter.post(sitemap.postResume, addResume)
attendancesRouter.post(sitemap.postPause, addBreak)
attendancesRouter.put(sitemap.put, updateEmployeeAttendance)
attendancesRouter.delete(sitemap.put, deleteEmployeeAttendance)

export default attendancesRouter
