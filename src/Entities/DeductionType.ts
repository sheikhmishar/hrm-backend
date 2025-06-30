import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class DeductionType {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: DeductionType.STATUSES,
    default: DeductionType.STATUSES[0]
  })
  @IsIn([...DeductionType.STATUSES, undefined])
  status!: (typeof DeductionType.STATUSES)[number]
}
