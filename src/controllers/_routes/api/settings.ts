import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import { allSettings, settingDetails, updateSetting } from '../../settings'
import { settings as sitemap } from '../SITEMAP'

const settingsRouter = express.Router()
settingsRouter.use(matchFlatRouterRootPath(sitemap._), isAuthenticated)
settingsRouter.get(sitemap.get, allSettings)
settingsRouter.get(sitemap.getByProperty, settingDetails)
settingsRouter.put(sitemap.put, updateSetting)

export default settingsRouter
