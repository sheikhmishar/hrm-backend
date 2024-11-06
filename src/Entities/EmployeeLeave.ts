import { Type } from 'class-transformer'
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min
} from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeLeave {
  public static TYPES = ['paid', 'unpaid'] as const
  public static STATUSES = ['pending', 'approved'] as const
  public static DURATIONS = ['fullday', 'halfday'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  from!: string

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  // TODO: validate greater
  to!: string

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  @IsNumber()
  @Min(0)
  totalDays!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  reason!: string

  @Column({
    type: 'enum',
    enum: EmployeeLeave.TYPES,
    default: EmployeeLeave.TYPES[0]
  })
  @IsIn(EmployeeLeave.TYPES)
  type!: (typeof EmployeeLeave.TYPES)[number]

  @Column({
    type: 'enum',
    enum: EmployeeLeave.STATUSES,
    default: EmployeeLeave.STATUSES[0]
  })
  @IsIn(EmployeeLeave.STATUSES)
  status!: (typeof EmployeeLeave.STATUSES)[number]

  @Column({
    type: 'enum',
    enum: EmployeeLeave.DURATIONS,
    default: EmployeeLeave.DURATIONS[0]
  })
  @IsIn(EmployeeLeave.DURATIONS)
  duration!: (typeof EmployeeLeave.DURATIONS)[number]

  @ManyToOne(_type => Employee, employee => employee.leaves, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
