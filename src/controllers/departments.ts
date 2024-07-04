import type { RequestHandler } from 'express'
import type { ResultSetHeader } from 'mysql2'

import Department from '../Entities/Department'
import IdParams from '../Entities/_IdParams'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { CREATED, NOT_FOUND, NOT_MODIFIED } = statusCodes
const { _params } = SITEMAP.departments

export const allDepartments: RequestHandler<{}, Department[]> = async (
  _,
  res,
  next
) => {
  try {
    res.json(await AppDataSource.getRepository(Department).find())
  } catch (err) {
    next(err)
  }
}

export const departmentDetails: RequestHandler<
  Partial<typeof _params>,
  Department
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)

    const department = await AppDataSource.getRepository(Department).findOne({
      where: { id }
    })
    if (!department)
      throw new ResponseError(`No Department with ID: ${id}`, NOT_FOUND)
    res.json(department)
  } catch (err) {
    next(err)
  }
}

export const addDepartment: RequestHandler<
  {},
  { message: string; data: Department },
  Partial<Department>
> = async (req, res, next) => {
  try {
    const department = await transformAndValidate(Department, req.body)

    const insertResult = await AppDataSource.manager.insert(
      Department,
      department
    )
    const departmentInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!departmentInsertResultRaw.affectedRows)
      throw new ResponseError('Department unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Department', data: department })
  } catch (err) {
    next(err)
  }
}

export const updateDepartment: RequestHandler<
  Partial<typeof _params>,
  { message: string; data: Department },
  Partial<Department>
> = async (req, res, next) => {
  try {
    const { id } = await transformAndValidate(IdParams, req.params)
    const previousDepartment = await AppDataSource.getRepository(
      Department
    ).findOneBy({
      id
    })
    const department = await transformAndValidate(Department, {
      ...previousDepartment,
      ...req.body
    })

    const result = await AppDataSource.manager.update(
      Department,
      { id },
      department
    )
    if (!result.affected)
      throw new ResponseError(`No Department with ID: ${id}`, NOT_FOUND)

    department.id = id
    res.json({ message: 'Department updated', data: department })
  } catch (err) {
    next(err)
  }
}
