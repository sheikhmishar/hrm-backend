import { IsNumber, IsPositive } from 'class-validator'

export default class IdParams {
  @IsNumber()
  @IsPositive()
  id!: number // TODO: get param name from _query
}

export class EmployeeIdParams {
  @IsNumber()
  @IsPositive()
  employeeId!: number // TODO: get param name from _query
}
