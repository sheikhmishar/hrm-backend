import express from 'express'

import { matchFlatRouterRootPath } from '../../_middlewares'
import { isAuthenticated } from '../../_middlewares/authentication'
import {
  allUsers,
  loginUser,
  registerUser,
  selfDetails,
  updateUser,
  userDetails
} from '../../users'
import { users as sitemap } from '../SITEMAP'

const usersRouter = express.Router()
usersRouter.use(matchFlatRouterRootPath(sitemap._))
usersRouter.get(sitemap.get, isAuthenticated, allUsers)
usersRouter.get(sitemap.getSelf, isAuthenticated, selfDetails)
usersRouter.get(sitemap.getById, isAuthenticated, userDetails)
usersRouter.post(sitemap.postRegister, registerUser)
usersRouter.post(sitemap.postLogin, loginUser)
usersRouter.put(sitemap.put, isAuthenticated, updateUser)

export default usersRouter
