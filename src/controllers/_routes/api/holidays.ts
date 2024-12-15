import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import { addHoliday, deleteHoliday, holidaysByMonth } from '../../holidays'
import SITEMAP from '../SITEMAP'

const { holidays: sitemap } = SITEMAP

const holidaysRouter = express.Router()
holidaysRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
holidaysRouter.get(sitemap.getByMonthStart, holidaysByMonth)
holidaysRouter.post(sitemap.post, addHoliday)
holidaysRouter.delete(sitemap.delete, deleteHoliday)

export default holidaysRouter
