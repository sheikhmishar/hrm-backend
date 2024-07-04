import { IsNotEmpty, IsString, IsIn } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class SalaryType {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: SalaryType.STATUSES,
    default: SalaryType.STATUSES[0]
  })
  @IsIn([...SalaryType.STATUSES, undefined])
  status!: (typeof SalaryType.STATUSES)[number]
}
