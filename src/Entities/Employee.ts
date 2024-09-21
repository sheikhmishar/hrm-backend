import { Type } from 'class-transformer'
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested
} from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation
} from 'typeorm'

import Branch from './Branch'
import Company from './Company'
import Department from './Department'
import Designation from './Designation'
import DutyType from './DutyType'
import SalaryType from './SalaryType'

@Entity()
export default class Employee {
  public static STATUSES = ['active', 'inactive'] as const
  public static APPLICABILITY = ['applicable', 'inApplicable'] as const
  public static GENDERS = ['Male', 'Female', 'Others'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @Index({ unique: true })
  @IsNotEmpty()
  eId!: string

  @Column()
  @Length(1, 20)
  name!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  altPhoneNumber?: string

  @Column()
  @IsEmail()
  email!: string

  @Column({ type: 'date' })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth!: string

  @Column()
  @IsNotEmpty()
  @IsString()
  fullAddress!: string

  @Column({ type: 'enum', enum: Employee.GENDERS })
  @IsIn(Employee.GENDERS)
  gender!: (typeof Employee.GENDERS)[number]

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  photo?: string

  @ManyToOne(() => Company, company => company.employees, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Company)
  company!: Company

  @ManyToOne(() => Department, { cascade: true, nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Department)
  department!: Department

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Branch)
  branch!: Branch

  @ManyToOne(() => Designation, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Designation)
  designation!: Designation

  @ManyToOne(() => DutyType, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => DutyType)
  dutyType!: DutyType

  @ManyToOne(() => SalaryType, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => SalaryType)
  salaryType!: Relation<SalaryType> // TODO:

  @Column({ type: 'date' })
  @IsNotEmpty()
  @IsDateString()
  dateOfJoining!: string

  @Column()
  // @Transform(({ value }) => parseInt(value))
  @IsNumber()
  unitSalary!: number

  @Column()
  @IsNumber({ allowNaN: false })
  taskWisePayment?: number

  @Column()
  @IsNumber({ allowNaN: false })
  wordLimit?: number

  @Column({ type: 'time' })
  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/, {
    message: 'Office Start Time must match HH:MM:SS format'
  })
  officeStartTime!: string

  @Column({ type: 'time' })
  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/, {
    message: 'Office Start Time must match HH:MM:SS format'
  })
  officeEndTime!: string

  @Column({ type: 'enum', enum: Employee.APPLICABILITY })
  @IsIn(Employee.APPLICABILITY)
  checkedInLateFee!: (typeof Employee.APPLICABILITY)[number]

  @Column({ type: 'enum', enum: Employee.APPLICABILITY })
  @IsIn(Employee.APPLICABILITY)
  overtime!: (typeof Employee.APPLICABILITY)[number]

  @Column({ type: 'date' })
  @IsOptional()
  @IsDateString()
  noticePeriod?: string

  @Column({ type: 'enum', enum: Employee.APPLICABILITY })
  @IsIn(Employee.APPLICABILITY)
  extraBonus!: (typeof Employee.APPLICABILITY)[number]

  @Column({
    type: 'enum',
    enum: Employee.STATUSES,
    default: Employee.STATUSES[0]
  })
  @IsIn([...Employee.STATUSES, undefined])
  status!: (typeof Employee.STATUSES)[number]

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  createdDate!: Date

  // static getAbsentEmployeesAtDate = (date: string) =>
  //   AppDataSource.manager.query(
  //     /*sql*/ `
  //     SELECT
  //       employee.id,
  //       employee.employeeName,
  //       employee.photo,
  //       d.designationName,
  //       c.companyName
  //     FROM employee
  //     INNER JOIN designation AS d
  //       ON d.id = employee.designationId
  //     INNER JOIN company AS c
  //       ON c.id = employee.companyId
  //     LEFT JOIN attendances AS a
  //       ON employee.employeeId = a.employee_id_
  //         AND a.date = ?
  //     WHERE
  //       employee.status = 'active'
  //       AND employee.dateOfJoining <= ?
  //       AND a.employee_id_ IS NULL
  // `,
  //     [date, date]
  //   )
}
