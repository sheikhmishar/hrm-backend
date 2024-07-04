import { IsNotEmpty, IsString, IsIn } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class Designation {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: Designation.STATUSES,
    default: Designation.STATUSES[0]
  })
  @IsIn([...Designation.STATUSES, undefined])
  status!: (typeof Designation.STATUSES)[number]
}
