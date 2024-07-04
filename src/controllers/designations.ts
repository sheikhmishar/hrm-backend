import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import Designation from '../Entities/Designation'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.designations

export const allDesignations: RequestHandler<{}, Designation[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(Designation).find())
  } catch (err) {
    next(err)
  }
}

export const designationDetails: RequestHandler<
  Partial<typeof _params>,
  Designation
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const designation = await AppDataSource.getRepository(Designation).findOne({
      where: { id }
    })
    if (!designation)
      throw new ResponseError(`No Designation with ID: ${id}`, NOT_FOUND)
    res.json(designation)
  } catch (err) {
    next(err)
  }
}

export const addDesignation: RequestHandler<
  {},
  { message: string; data: Designation },
  Partial<Designation>
> = async (req, res, next) => {
  try {
    const designation = await transformAndValidate(Designation, req.body)

    const insertResult = await AppDataSource.manager.insert(
      Designation,
      designation
    )
    const designationInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!designationInsertResultRaw.affectedRows)
      throw new ResponseError('Designation unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Designation', data: designation })
  } catch (err) {
    next(err)
  }
}

export const updateDesignation: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Designation },
  Partial<Designation>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousDesignation = await AppDataSource.getRepository(
      Designation
    ).findOneBy({
      id
    })
    const designation = await transformAndValidate(Designation, {
      ...previousDesignation,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      Designation,
      { id },
      designation
    )
    if (!result.affected)
      throw new ResponseError(`No Designation with ID: ${id}`, NOT_FOUND)

    designation.id = id
    res.json({ message: 'Designation updated', data: designation })
  } catch (err) {
    next(err)
  }
}
