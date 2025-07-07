import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import Employee from './Employee'
import EmployeeAttendanceSession from './EmployeeAttendanceSessions'

@Entity()
export default class EmployeeAttendance {
  @PrimaryGeneratedColumn()
  public id!: number

  @Column()
  @IsNumber({ allowNaN: false })
  public late!: number

  @Column()
  @IsNumber({ allowNaN: false })
  public overtime!: number

  @Column()
  @IsNumber({ allowNaN: false })
  @Min(0)
  public totalTime!: number

  @Column({ type: 'date' })
  @IsDateString()
  public date!: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  public tasks?: string

  @OneToMany(
    _type => EmployeeAttendanceSession,
    session => session.attendance,
    { nullable: false, eager: true, cascade: true }
  )
  @IsArray()
  @ValidateNested()
  @JoinColumn()
  @Type(_ => EmployeeAttendanceSession)
  sessions!: EmployeeAttendanceSession[]

  @ManyToOne(_type => Employee, employee => employee.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
