import { IsDateString, IsNotEmpty } from 'class-validator'
import type { RequestHandler } from 'express'
import { type ResultSetHeader } from 'mysql2'
import { And, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'

import Holiday from '../Entities/Holiday'
import { ResponseError } from '../configs'
import AppDataSource from '../configs/db'
import { getDateRange } from '../utils/misc'
import transformAndValidate from '../utils/transformAndValidate'
import { statusCodes } from './_middlewares/response-code'
import SITEMAP from './_routes/SITEMAP'

const { NOT_FOUND, NOT_MODIFIED, CREATED } = statusCodes
const { _params } = SITEMAP.holidays

class GetQuery {
  @IsDateString()
  @IsNotEmpty()
  monthStart!: string
}
_params satisfies GetQuery // TODO: everywhere

export const holidaysByMonth: RequestHandler<
  Partial<typeof _params>,
  Holiday[]
> = async (req, res, next) => {
  try {
    const { monthStart } = await transformAndValidate(GetQuery, req.params)
    const [startDate, endDate] = getDateRange(monthStart).map(date =>
      date.toISOString().substring(0, 10)
    ) as [string, string]

    const holidays = await AppDataSource.getRepository(Holiday).findBy({
      date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate))
    })

    res.json(holidays)
  } catch (err) {
    next(err)
  }
}

export const addHoliday: RequestHandler<
  {},
  { message: string; data: Holiday },
  Partial<Holiday>
> = async (req, res, next) => {
  try {
    const holiday = await transformAndValidate(Holiday, req.body)

    const insertResult = await AppDataSource.manager.insert(Holiday, holiday)
    const holidayInsertResultRaw: ResultSetHeader = insertResult.raw
    if (!holidayInsertResultRaw.affectedRows)
      throw new ResponseError('Holiday unchanged', NOT_MODIFIED)

    res
      .status(CREATED)
      .json({ message: 'Successfully Created Holiday', data: holiday })
  } catch (err) {
    next(err)
  }
}

class DeleteQuery {
  @IsDateString()
  @IsNotEmpty()
  date!: string
}
_params satisfies DeleteQuery

export const deleteHoliday: RequestHandler<
  Partial<typeof _params>,
  { message: string }
> = async (req, res, next) => {
  try {
    const { date } = await transformAndValidate(DeleteQuery, req.params)

    const result = await AppDataSource.manager.delete(Holiday, {
      date: date
    } satisfies Holiday) // TODO: every delete like this satisfies
    if (!result.affected)
      throw new ResponseError(`No Holiday with month start: ${date}`, NOT_FOUND)

    res.json({ message: 'Holiday deleted : ' + date })
  } catch (err) {
    next(err)
  }
}
