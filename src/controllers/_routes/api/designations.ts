import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addDesignation,
  allDesignations,
  designationDetails,
  updateDesignation
} from '../../designations'
import { designations as sitemap } from '../SITEMAP'

const designationsRouter = express.Router()
designationsRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
designationsRouter.get(sitemap.get, allDesignations)
designationsRouter.get(sitemap.getById, designationDetails)
designationsRouter.post(sitemap.post, addDesignation)
designationsRouter.put(sitemap.put, updateDesignation)

export default designationsRouter
