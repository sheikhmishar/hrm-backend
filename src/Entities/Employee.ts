import { Type } from 'class-transformer'
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsIn,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
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

import AppDataSource from '../configs/db'
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

  @ManyToOne(() => Department, department => department.employees, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Department)
  department!: Department

  @ManyToOne(() => Branch, branch => branch.employees, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Branch)
  branch!: Branch

  @ManyToOne(() => Designation, designation => designation.employees, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => Designation)
  designation!: Designation

  @ManyToOne(() => DutyType, dutyType => dutyType.employees, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsNotEmpty()
  @ValidateNested()
  @Type(_ => DutyType)
  dutyType!: DutyType

  @ManyToOne(() => SalaryType, salaryType => salaryType.employees, {
    cascade: true,
    nullable: false
  })
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
  @IsMilitaryTime()
  officeStartTime!: string

  @Column({ type: 'time' })
  @IsMilitaryTime()
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

  static getAbsentEmployeesAtDate = (date: string) =>
    AppDataSource.manager.query(
      /*sql*/ `
    SELECT
      employee.id,
      employee.employeeName,
      employee.photo,
      d.designationName,
      c.companyName
    FROM employee
    INNER JOIN designation AS d
      ON d.id = employee.designationId
    INNER JOIN company AS c
      ON c.id = employee.companyId
    LEFT JOIN attendances AS a
      ON employee.employeeId = a.employee_id_
        AND a.date = ?
    WHERE
      employee.status = 'active'
      AND employee.dateOfJoining <= ?
      AND a.employee_id_ IS NULL
`,
      [date, date]
    )
}
