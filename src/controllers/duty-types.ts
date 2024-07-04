import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import DutyType from '../Entities/DutyType'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.dutyTypes

export const allDutyTypes: RequestHandler<{}, DutyType[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(DutyType).find())
  } catch (err) {
    next(err)
  }
}

export const dutyTypeDetails: RequestHandler<
  Partial<typeof _params>,
  DutyType
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const dutyType = await AppDataSource.getRepository(DutyType).findOne({
      where: { id }
    })
    if (!dutyType)
      throw new ResponseError(`No Duty Type with ID: ${id}`, NOT_FOUND)
    res.json(dutyType)
  } catch (err) {
    next(err)
  }
}

export const addDutyType: RequestHandler<
  {},
  { message: string; data: DutyType },
  Partial<DutyType>
> = async (req, res, next) => {
  try {
    const dutyType = await transformAndValidate(DutyType, req.body)

    const insertResult = await AppDataSource.manager.insert(DutyType, dutyType)
    const dutyTypeInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!dutyTypeInsertResultRaw.affectedRows)
      throw new ResponseError('Duty Type unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Duty Type', data: dutyType })
  } catch (err) {
    next(err)
  }
}

export const updateDutyType: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: DutyType },
  Partial<DutyType>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousDutyType = await AppDataSource.getRepository(
      DutyType
    ).findOneBy({ id })
    const dutyType = await transformAndValidate(DutyType, {
      ...previousDutyType,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      DutyType,
      { id },
      dutyType
    )
    if (!result.affected)
      throw new ResponseError(`No Duty Type with ID: ${id}`, NOT_FOUND)

    dutyType.id = id
    res.json({ message: 'Duty Type updated', data: dutyType })
  } catch (err) {
    next(err)
  }
}
