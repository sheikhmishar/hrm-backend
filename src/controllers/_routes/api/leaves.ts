import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addEmployeeLeave,
  allEmployeeLeaves,
  employeeLeaveDetails,
  deleteEmployeeLeave
} from '../../leaves'
import { leaves as sitemap } from '../SITEMAP'

const leavesRouter = express.Router()
leavesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
leavesRouter.get(sitemap.get, allEmployeeLeaves)
leavesRouter.get(sitemap.getByEmployeeId, employeeLeaveDetails)
leavesRouter.post(sitemap.post, addEmployeeLeave)
leavesRouter.delete(sitemap.delete, deleteEmployeeLeave)

export default leavesRouter
