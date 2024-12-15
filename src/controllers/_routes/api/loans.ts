import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import { addLoan, allLoans, deleteLoan, loanByEmployee } from '../../loans'
import SITEMAP from '../SITEMAP'

const { loans: sitemap } = SITEMAP

const loansRouter = express.Router()
loansRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
loansRouter.get(sitemap.get, allLoans)
loansRouter.get(sitemap.getByEmployeeId, loanByEmployee)
loansRouter.post(sitemap.post, addLoan)
loansRouter.delete(sitemap.delete, deleteLoan)

export default loansRouter
