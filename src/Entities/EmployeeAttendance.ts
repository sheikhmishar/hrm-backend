import { Type } from 'class-transformer'
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches
} from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { IsAfterTime } from '../utils/misc'
import Employee from './Employee'

@Entity()
export default class EmployeeAttendance {
  @PrimaryGeneratedColumn()
  public id!: number

  @Column({ type: 'time' })
  @IsString()
  @Matches(/\d{2}:\d{2}/i, { message: 'Bad Arrival Time' })
  public arrivalTime!: string

  @Column({ type: 'time' })
  @Matches(/\d{2}:\d{2}/i, { message: 'Bad Leave Time' })
  @IsAfterTime('arrivalTime', {
    message: 'Leave Time Cannot Be Less Than Arrival Time'
  })
  public leaveTime!: string

  @Column()
  @IsNumber({ allowNaN: false })
  public late!: number

  @Column()
  @IsNumber({ allowNaN: false })
  public overtime!: number

  @Column()
  @IsNumber({ allowNaN: false })
  public totalTime!: number

  @Column({ type: 'date' })
  @IsDateString()
  public date!: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  public tasks?: string

  @ManyToOne(_type => Employee, employee => employee.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
