import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  addBranch,
  allBranches,
  branchDetails,
  updateBranch
} from '../../branches'
import { branches as sitemap } from '../SITEMAP'

const branchesRouter = express.Router()
branchesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
branchesRouter.get(sitemap.get, allBranches)
branchesRouter.get(sitemap.getById, branchDetails)
branchesRouter.post(sitemap.post, addBranch)
branchesRouter.put(sitemap.put, updateBranch)

export default branchesRouter
