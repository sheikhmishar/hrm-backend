import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addBonusType,
  allBonusTypes,
  bonusTypeDetails,
  updateBonusType
} from '../../bonus-types'
import SITEMAP from '../SITEMAP'

const { bonusTypes: sitemap } = SITEMAP

const bonusTypesRouter = express.Router()
bonusTypesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
bonusTypesRouter.get(sitemap.get, allBonusTypes)
bonusTypesRouter.get(sitemap.getById, bonusTypeDetails)
bonusTypesRouter.post(sitemap.post, addBonusType)
bonusTypesRouter.put(sitemap.put, updateBonusType)

export default bonusTypesRouter
