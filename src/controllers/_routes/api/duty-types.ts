import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addDutyType,
  allDutyTypes,
  dutyTypeDetails,
  updateDutyType
} from '../../duty-types'
import { dutyTypes as sitemap } from '../SITEMAP'

const dutyTypesRouter = express.Router()
dutyTypesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
dutyTypesRouter.get(sitemap.get, allDutyTypes)
dutyTypesRouter.get(sitemap.getById, dutyTypeDetails)
dutyTypesRouter.post(sitemap.post, addDutyType)
dutyTypesRouter.put(sitemap.put, updateDutyType)

export default dutyTypesRouter
