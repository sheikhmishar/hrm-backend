import { Type } from 'class-transformer'
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeSalary {
  public static STATUSES = ['paid', 'unpaid'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  month!: string

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  paidAt!: string

  @Column({ default: 0 })
  @IsNumber()
  @IsNotEmpty()
  overtime!: number

  @Column({ default: 0, type: 'decimal' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  overtimePayment!: number

  @Column({ default: 0 })
  @IsNumber()
  @IsNotEmpty()
  lateMinutes!: number

  @Column({ default: 0, type: 'decimal' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  latePenalty!: number

  @Column({ default: 0, type: 'decimal' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  bonus!: number

  // TODO: autocalculate
  @Column({ default: 0, type: 'decimal' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalSalary!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string

  @Column({
    type: 'enum',
    enum: EmployeeSalary.STATUSES,
    default: EmployeeSalary.STATUSES[0]
  })
  @IsIn(EmployeeSalary.STATUSES)
  status!: string

  @ManyToOne(_type => Employee, employee => employee.salaries, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
