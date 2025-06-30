import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import DeductionType from '../Entities/DeductionType'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.deductionTypes

export const allDeductionTypes: RequestHandler<{}, DeductionType[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(DeductionType).find())
  } catch (err) {
    next(err)
  }
}

export const deductionTypeDetails: RequestHandler<
  Partial<typeof _params>,
  DeductionType
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const deductionType = await AppDataSource.getRepository(DeductionType).findOne({
      where: { id }
    })
    if (!deductionType)
      throw new ResponseError(`No Deduction Type with ID: ${id}`, NOT_FOUND)
    res.json(deductionType)
  } catch (err) {
    next(err)
  }
}

export const addDeductionType: RequestHandler<
  {},
  { message: string; data: DeductionType },
  Partial<DeductionType>
> = async (req, res, next) => {
  try {
    const deductionType = await transformAndValidate(DeductionType, req.body)

    const insertResult = await AppDataSource.manager.insert(
      DeductionType,
      deductionType
    )
    const deductionTypeInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!deductionTypeInsertResultRaw.affectedRows)
      throw new ResponseError('Deduction Type unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Deduction Type', data: deductionType })
  } catch (err) {
    next(err)
  }
}

export const updateDeductionType: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: DeductionType },
  Partial<DeductionType>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousDeductionType = await AppDataSource.getRepository(
      DeductionType
    ).findOneBy({ id })
    const deductionType = await transformAndValidate(DeductionType, {
      ...previousDeductionType,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      DeductionType,
      { id },
      deductionType
    )
    if (!result.affected)
      throw new ResponseError(`No Deduction Type with ID: ${id}`, NOT_FOUND)

    deductionType.id = id
    res.json({ message: 'Deduction Type updated', data: deductionType })
  } catch (err) {
    next(err)
  }
}
