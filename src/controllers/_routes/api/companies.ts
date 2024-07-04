import express from 'express'

import { isAuthenticated } from '../../../controllers/_middlewares/authentication'
import { matchFlatRouterRootPath } from '../../_middlewares'
import {
  addCompany,
  allCompanies,
  companyDetails,
  updateCompany
} from '../../companies'
import { companies as sitemap } from '../SITEMAP'

const companiesRouter = express.Router()
companiesRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
companiesRouter.get(sitemap.get, allCompanies)
companiesRouter.get(sitemap.getById, companyDetails)
companiesRouter.post(sitemap.post, addCompany)
companiesRouter.put(sitemap.put, updateCompany)

export default companiesRouter
