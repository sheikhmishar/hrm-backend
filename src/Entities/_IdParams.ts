import { IsNumber, IsPositive } from 'class-validator'

import SITEMAP from '../controllers/_routes/SITEMAP'

export default class IdParams {
  @IsNumber()
  @IsPositive()
  id!: number
}

SITEMAP.users._params satisfies { [k in keyof IdParams]: string }

export class EmployeeIdParams {
  @IsNumber()
  @IsPositive()
  employeeId!: number
}
SITEMAP.attendances._params satisfies { [k in keyof EmployeeIdParams]: string }
