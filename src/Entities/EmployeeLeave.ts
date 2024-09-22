import { Type } from 'class-transformer'
import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeLeave {
  public static TYPES = ['paid', 'unpaid'] as const
  public static STATUSES = ['pending', 'approved'] as const
  public static DURATIONS = ['fullday', 'halfday'] as const
  public static SHIFTS = ['firstHalfDay', 'secondHalfDay'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  from!: string

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  to!: string

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
  type!: string

  @Column({
    type: 'enum',
    enum: EmployeeLeave.STATUSES,
    default: EmployeeLeave.STATUSES[0]
  })
  @IsIn(EmployeeLeave.STATUSES)
  status!: string

  @Column({
    type: 'enum',
    enum: EmployeeLeave.DURATIONS,
    default: EmployeeLeave.DURATIONS[0]
  })
  @IsIn(EmployeeLeave.DURATIONS)
  duration!: string

  @Column({
    type: 'enum',
    enum: EmployeeLeave.SHIFTS,
    default: EmployeeLeave.SHIFTS[0]
  })
  @IsIn(EmployeeLeave.SHIFTS)
  shift!: string

  @ManyToOne(_type => Employee, employee => employee.leaves, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
