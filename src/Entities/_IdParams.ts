import { IsNumber, IsPositive } from 'class-validator'

export default class IdParams {
  @IsNumber()
  @IsPositive()
  id!: number
}
