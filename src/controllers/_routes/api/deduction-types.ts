import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addDeductionType,
  allDeductionTypes,
  deductionTypeDetails,
  updateDeductionType
} from '../../deduction-types'
import SITEMAP from '../SITEMAP'

const { deductionTypes: sitemap } = SITEMAP

const deductionTypesRouter = express.Router()
deductionTypesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
deductionTypesRouter.get(sitemap.get, allDeductionTypes)
deductionTypesRouter.get(sitemap.getById, deductionTypeDetails)
deductionTypesRouter.post(sitemap.post, addDeductionType)
deductionTypesRouter.put(sitemap.put, updateDeductionType)

export default deductionTypesRouter
