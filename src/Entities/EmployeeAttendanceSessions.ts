import { Transform, Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { IsAfterTime } from '../utils/misc'
import EmployeeAttendance from './EmployeeAttendance'

@Entity()
export default class EmployeeAttendanceSession {
  @PrimaryGeneratedColumn()
  public id!: number

  @Column({ type: 'time' })
  @IsString()
  @Matches(/\d{2}:\d{2}/i, { message: 'Bad Arrival Time' })
  public arrivalTime!: string

  // FIXME:
  @Column({ type: 'time', nullable: true })
  @Transform(({ value }) => (!value ? undefined : value))
  @IsOptional()
  @Matches(/\d{2}:\d{2}/i, { message: 'Bad Leave Time' })
  @IsAfterTime('arrivalTime', {
    message: 'Leave Time Cannot Be Less Than Arrival Time'
  })
  public leaveTime?: string

  @Column()
  @IsNumber({ allowNaN: false })
  @Min(0)
  public sessionTime!: number

  @ManyToOne(_type => EmployeeAttendance, attendance => attendance.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @Type(_ => EmployeeAttendance)
  attendance!: EmployeeAttendance
}
