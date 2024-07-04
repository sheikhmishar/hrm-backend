import { IsNotEmpty, IsString, IsIn } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class DutyType {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: DutyType.STATUSES,
    default: DutyType.STATUSES[0]
  })
  @IsIn([...DutyType.STATUSES, undefined])
  status!: (typeof DutyType.STATUSES)[number]
}
