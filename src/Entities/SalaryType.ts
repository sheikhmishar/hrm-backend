import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Employee from './Employee'

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

  @OneToMany(() => Employee, employee => employee.company)
  employees!: Employee[]
}
