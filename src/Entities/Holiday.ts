import { IsDateString } from 'class-validator'
import { Entity, PrimaryColumn } from 'typeorm'

@Entity()
export default class Holiday {
  @PrimaryColumn({ type: 'date' })
  @IsDateString()
  date!: string
}
