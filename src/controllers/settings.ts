import { IsNotEmpty, IsString } from 'class-validator'
import type { RequestHandler } from 'express'

import Setting from '../Entities/Setting'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { SETTINGS, SETTING_KEYS } from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { NOT_FOUND, UNPROCESSABLE_ENTITY } = statusCodes
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
    if (setting.property === SETTING_KEYS.PAYROLL_CYCLE_START_DATE) {
      const value = parseInt(setting.value)
      if (parseInt(setting.value) < 1 || parseInt(setting.value) > 28)
        throw new ResponseError(
          'Value must be between 1 and 28',
          UNPROCESSABLE_ENTITY
        )

      SETTINGS.PAYROLL_CYCLE_START_DATE = value
    }

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
