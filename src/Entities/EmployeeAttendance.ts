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

  //  TODO: only company name
  // public static readonly SQL_COMPANY_WISE_COUNT_BY_DATE = `
  // WITH
  // \`employeeTotal\` AS (
  //   SELECT
  //     \`employee\`.\`companyId\`,
  //     COUNT(*) \`totalEmployee\`
  //   FROM
  //     \`employee\`
  //   WHERE
  //     \`employee\`.\`dateOfJoining\` <= ?
  //   GROUP BY
  //     \`employee\`.\`companyId\`
  // ),
  // \`employeePresent\` AS (
  //   SELECT
  //     \`employee\`.\`companyId\`,
  //     COUNT(*) \`presentEmployee\`
  //   FROM
  //     \`employee\`
  //   INNER JOIN \`employee_attendance\`
  //     ON \`employee_attendance\`.\`employeeId\` = \`employee\`.\`id\`
  //   WHERE
  //     \`employee_attendance\`.\`date\` = ?
  //   GROUP BY
  //     \`employee\`.\`id\`,
  //     \`employee\`.\`companyId\`
  // ),
  // \`employeeLeave\` AS (
  //   SELECT
  //     \`employee\`.\`companyId\`,
  //     COUNT(*) \`leaveEmployee\`
  //   FROM
  //     \`employee\`
  //   INNER JOIN \`employee_leave\`
  //     ON \`employee_leave\`.\`employeeId\` = \`employee\`.\`id\`
  //   WHERE
  //     \`employee_leave\`.\`from\` <= ?
  //     AND \`employee_leave\`.\`to\` >= ?
  //     AND \`employee_leave\`.\`type\` >= 'paid'
  //   GROUP BY
  //     \`employee\`.\`id\`,
  //     \`employee\`.\`companyId\`
  // )
  // SELECT
  //   \`company\`.*,
  //   IFNULL(\`employeePresent\`.\`presentEmployee\`, 0) \`presentEmployee\`,
  //   IFNULL(\`employeeTotal\`.\`totalEmployee\`, 0) \`totalEmployee\`,
  //   IFNULL(\`employeeLeave\`.\`leaveEmployee\`, 0) \`leaveEmployee\`
  // FROM \`company\`
  // LEFT JOIN \`employeeTotal\`
  // ON \`company\`.\`id\` = \`employeeTotal\`.\`companyId\`
  // LEFT JOIN \`employeePresent\`
  // ON \`company\`.\`id\` = \`employeePresent\`.\`companyId\`
  // LEFT JOIN \`employeeLeave\`
  // ON \`company\`.\`id\` = \`employeeLeave\`.\`companyId\`;
  // `
}
