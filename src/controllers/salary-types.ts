import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import SalaryType from '../Entities/SalaryType'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.salaryTypes

export const allSalaryTypes: RequestHandler<{}, SalaryType[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(SalaryType).find())
  } catch (err) {
    next(err)
  }
}

export const salaryTypeDetails: RequestHandler<
  Partial<typeof _params>,
  SalaryType
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const salaryType = await AppDataSource.getRepository(SalaryType).findOne({
      where: { id }
    })
    if (!salaryType)
      throw new ResponseError(`No Salary Type with ID: ${id}`, NOT_FOUND)
    res.json(salaryType)
  } catch (err) {
    next(err)
  }
}

export const addSalaryType: RequestHandler<
  {},
  { message: string; data: SalaryType },
  Partial<SalaryType>
> = async (req, res, next) => {
  try {
    const salaryType = await transformAndValidate(SalaryType, req.body)

    const insertResult = await AppDataSource.manager.insert(
      SalaryType,
      salaryType
    )
    const salaryTypeInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!salaryTypeInsertResultRaw.affectedRows)
      throw new ResponseError('Salary Type unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Salary Type', data: salaryType })
  } catch (err) {
    next(err)
  }
}

export const updateSalaryType: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: SalaryType },
  Partial<SalaryType>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousSalaryType = await AppDataSource.getRepository(
      SalaryType
    ).findOneBy({ id })
    const salaryType = await transformAndValidate(SalaryType, {
      ...previousSalaryType,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      SalaryType,
      { id },
      salaryType
    )
    if (!result.affected)
      throw new ResponseError(`No Salary Type with ID: ${id}`, NOT_FOUND)

    salaryType.id = id
    res.json({ message: 'Salary Type updated', data: salaryType })
  } catch (err) {
    next(err)
  }
}
