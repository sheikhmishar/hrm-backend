import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import Branch from '../Entities/Branch'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.branches

export const allBranches: RequestHandler<{}, Branch[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(Branch).find())
  } catch (err) {
    next(err)
  }
}

export const branchDetails: RequestHandler<
  Partial<typeof _params>,
  Branch
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const branch = await AppDataSource.getRepository(Branch).findOne({
      where: { id }
    })
    if (!branch) throw new ResponseError(`No Branch with ID: ${id}`, NOT_FOUND)
    res.json(branch)
  } catch (err) {
    next(err)
  }
}

export const addBranch: RequestHandler<
  {},
  { message: string; data: Branch },
  Partial<Branch>
> = async (req, res, next) => {
  try {
    const branch = await transformAndValidate(Branch, req.body)

    const insertResult = await AppDataSource.manager.insert(Branch, branch)
    const branchInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!branchInsertResultRaw.affectedRows)
      throw new ResponseError('Branch unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Branch', data: branch })
  } catch (err) {
    next(err)
  }
}

export const updateBranch: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Branch },
  Partial<Branch>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousBranch = await AppDataSource.getRepository(Branch).findOneBy({
      id
    })
    const branch = await transformAndValidate(Branch, {
      ...previousBranch,
      ...req.body
    })

    const result = await AppDataSource.manager.update(Branch, { id }, branch)
    if (!result.affected)
      throw new ResponseError(`No Branch with ID: ${id}`, NOT_FOUND)

    branch.id = id
    res.json({ message: 'Branch updated', data: branch })
  } catch (err) {
    next(err)
  }
}
