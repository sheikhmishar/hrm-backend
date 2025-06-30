import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import BonusType from '../Entities/BonusType'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.bonusTypes

export const allBonusTypes: RequestHandler<{}, BonusType[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(BonusType).find())
  } catch (err) {
    next(err)
  }
}

export const bonusTypeDetails: RequestHandler<
  Partial<typeof _params>,
  BonusType
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const bonusType = await AppDataSource.getRepository(BonusType).findOne({
      where: { id }
    })
    if (!bonusType)
      throw new ResponseError(`No Bonus Type with ID: ${id}`, NOT_FOUND)
    res.json(bonusType)
  } catch (err) {
    next(err)
  }
}

export const addBonusType: RequestHandler<
  {},
  { message: string; data: BonusType },
  Partial<BonusType>
> = async (req, res, next) => {
  try {
    const bonusType = await transformAndValidate(BonusType, req.body)

    const insertResult = await AppDataSource.manager.insert(
      BonusType,
      bonusType
    )
    const bonusTypeInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!bonusTypeInsertResultRaw.affectedRows)
      throw new ResponseError('Bonus Type unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Bonus Type', data: bonusType })
  } catch (err) {
    next(err)
  }
}

export const updateBonusType: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: BonusType },
  Partial<BonusType>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousBonusType = await AppDataSource.getRepository(
      BonusType
    ).findOneBy({ id })
    const bonusType = await transformAndValidate(BonusType, {
      ...previousBonusType,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      BonusType,
      { id },
      bonusType
    )
    if (!result.affected)
      throw new ResponseError(`No Bonus Type with ID: ${id}`, NOT_FOUND)

    bonusType.id = id
    res.json({ message: 'Bonus Type updated', data: bonusType })
  } catch (err) {
    next(err)
  }
}
