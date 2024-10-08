import type { RequestHandler } from 'express'

import { IsNotEmpty, IsString } from 'class-validator'
import Setting from '../Entities/Setting'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { NOT_FOUND } = statusCodes
const { _params } = SITEMAP.settings

export const allSettings: RequestHandler<{}, Setting[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(Setting).find())
  } catch (err) {
    next(err)
  }
}

export class KeyValue {
  @IsString()
  @IsNotEmpty()
  property!: string
}

export const settingDetails: RequestHandler<
  Partial<typeof _params>,
  Setting
> = async (req, res, next) => {
  try {
    const { property } = await transformAndValidate(KeyValue, req.params)

    const setting = await AppDataSource.getRepository(Setting).findOneBy({
      property
    })
    if (!setting)
      throw new ResponseError(
        `No Setting with property: ${property}`,
        NOT_FOUND
      )
    res.json(setting)
  } catch (err) {
    next(err)
  }
}

export const updateSetting: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Setting },
  Partial<Setting>
> = async (req, res, next) => {
  try {
    const { property } = await transformAndValidate(KeyValue, req.params)
    const previousSetting = await AppDataSource.getRepository(
      Setting
    ).findOneBy({ property })
    const setting = await transformAndValidate(Setting, {
      ...previousSetting,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      Setting,
      { property },
      setting
    )
    if (!result.affected)
      throw new ResponseError(
        `No Setting with property: ${property}`,
        NOT_FOUND
      )

    res.json({ message: 'Setting updated', data: setting })
  } catch (err) {
    next(err)
  }
}
