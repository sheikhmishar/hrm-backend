import { Type } from 'class-transformer'
import { IsNumber, IsOptional, Matches, Min } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { IsAfterTime } from '../utils/misc'
import EmployeeAttendance from './EmployeeAttendance'

@Entity()
export default class EmployeeAttendanceSession {
  @PrimaryGeneratedColumn()
  public id!: number

  @Column()
  @Matches(/^(?:[0-3][0-9]|4[0-7]):[0-5][0-9](?::[0-5][0-9])?$/, {
    message: 'Bad Arrival Time'
  })
  public arrivalTime!: string

  // FIXME: optional match
  @Column({ nullable: true })
  @IsOptional()
  @Matches(/^(?:(?:[0-3][0-9]|4[0-7]):[0-5][0-9](?::[0-5][0-9])?)?$/, {
    message: 'Bad Leave Time'
  })
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
