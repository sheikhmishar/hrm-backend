import { Type } from 'class-transformer'
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches
} from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { IsAfterTime } from '../utils/misc'
import Company from './Company'
import Employee from './Employee'

export type CompanyWiseCountByDate = Company & { presentEmployee: number }

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
  public late!: number

  @Column()
  public overtime!: number

  @Column()
  public totalTime!: number

  @Column({ type: 'date' })
  @IsDateString()
  public date!: string

  @Column()
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

  public static readonly SQL_COMPANY_WISE_COUNT_BY_DATE = `
  SELECT
    \`company\`.*,
    IFNULL(\`employee\`.\`presentEmployee\`, 0) \`presentEmployee\`
  FROM
    \`company\`
  LEFT JOIN(
    SELECT
      \`employee\`.\`companyId\`,
      COUNT(*) \`presentEmployee\`
    FROM
      \`employee\`
    INNER JOIN \`employee_attendance\`
      ON \`employee_attendance\`.\`employeeId\` = \`employee\`.\`id\`
    WHERE
      \`employee_attendance\`.\`date\` = ?
    GROUP BY
      \`employee\`.\`id\`,
      \`employee\`.\`companyId\`
  ) \`employee\`
  ON
    \`company\`.\`id\` = \`employee\`.\`companyId\`;
  `
}
