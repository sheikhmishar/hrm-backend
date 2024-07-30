import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import Company from '../Entities/Company'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.companies

export const allCompanies: RequestHandler<{}, Company[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(
      await AppDataSource.getRepository(Company).find({
        relations: { employees: true }
      })
    )
  } catch (err) {
    next(err)
  }
}

export const companyDetails: RequestHandler<
  Partial<typeof _params>,
  Company
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const company = await AppDataSource.getRepository(Company).findOne({
      where: { id }
    })
    if (!company)
      throw new ResponseError(`No Company with ID: ${id}`, NOT_FOUND)
    res.json(company)
  } catch (err) {
    next(err)
  }
}

export const addCompany: RequestHandler<
  {},
  { message: string; data: Company },
  Partial<Company>
> = async (req, res, next) => {
  try {
    const company = await transformAndValidate(Company, req.body)

    const insertResult = await AppDataSource.manager.insert(Company, company)
    const companyInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!companyInsertResultRaw.affectedRows)
      throw new ResponseError('Company unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Company', data: company })
  } catch (err) {
    next(err)
  }
}

export const updateCompany: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Company },
  Partial<Company>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousCompany = await AppDataSource.getRepository(
      Company
    ).findOneBy({ id })
    const company = await transformAndValidate(Company, {
      ...previousCompany,
      ...req.body
    })

    const result = await AppDataSource.manager.update(Company, { id }, company)
    if (!result.affected)
      throw new ResponseError(`No Company with ID: ${id}`, NOT_FOUND)

    company.id = id
    res.json({ message: 'Company updated', data: company })
  } catch (err) {
    next(err)
  }
}
