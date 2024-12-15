import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addSalaryType,
  allSalaryTypes,
  salaryTypeDetails,
  updateSalaryType
} from '../../salary-types'
import SITEMAP from '../SITEMAP'

const { salaryTypes: sitemap } = SITEMAP

const salaryTypesRouter = express.Router()
salaryTypesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
salaryTypesRouter.get(sitemap.get, allSalaryTypes)
salaryTypesRouter.get(sitemap.getById, salaryTypeDetails)
salaryTypesRouter.post(sitemap.post, addSalaryType)
salaryTypesRouter.put(sitemap.put, updateSalaryType)

export default salaryTypesRouter
