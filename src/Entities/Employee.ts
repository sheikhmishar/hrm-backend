import { Type } from 'class-transformer'
import {
  IsArray,
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
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation
} from 'typeorm'

import { IsAfterTime } from '../utils/misc'
import Branch from './Branch'
import Company from './Company'
import Department from './Department'
import Designation from './Designation'
import DutyType from './DutyType'
import EmployeeAsset from './EmployeeAsset'
import EmployeeAttendance from './EmployeeAttendance'
import EmployeeContact from './EmployeeContacts'
import EmployeeDocument from './EmployeeDocument'
import EmployeeFinancial from './EmployeeFinancial'
import EmployeeLeave from './EmployeeLeave'
import EmployeeSalary from './EmployeeSalary'
import Loan from './Loan'
import SalaryType from './SalaryType'

@Entity()
export default class Employee {
  public static STATUSES = ['active', 'inactive'] as const
  public static GENDERS = ['Male', 'Female', 'Others'] as const
  public static TYPES = ['SuperAdmin', 'Admin', 'Employee'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 100 })
  @Length(1, 100)
  name!: string

  @Column({ length: 16 })
  @IsString()
  @Length(1, 16) // TODO: align with migration
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

  @ManyToOne(_type => Company, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Company)
  company!: Company

  @ManyToOne(() => Department, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Department)
  department!: Department

  @ManyToOne(_type => Branch, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Branch)
  branch!: Branch

  @ManyToOne(_type => Designation, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Designation)
  designation!: Designation

  @ManyToOne(_type => DutyType, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => DutyType)
  dutyType!: DutyType

  @ManyToOne(_type => SalaryType, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => SalaryType)
  salaryType!: Relation<SalaryType> // TODO:

  @Column({ type: 'date' })
  @IsNotEmpty()
  @IsDateString()
  dateOfJoining!: string

  // @Transform(({ value }) => parseInt(value))
  @Column()
  @IsNumber()
  @Min(0)
  basicSalary!: number

  @Column()
  @IsNumber()
  @Min(0)
  houseRent!: number

  @Column()
  @IsNumber()
  @Min(0)
  foodCost!: number

  @Column()
  @IsNumber()
  @Min(0)
  conveyance!: number

  @Column()
  @IsNumber()
  @Min(0)
  medicalCost!: number

  @Column()
  @IsNumber()
  @Min(0)
  totalSalary!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  loanTaken!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  loanRemaining!: number

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber({ allowNaN: false })
  taskWisePayment?: number

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber({ allowNaN: false })
  wordLimit?: number

  @Column({ type: 'time' })
  @Matches(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/, {
    message: 'Office Start Time must match HH:MM[:SS] format'
  })
  @IsAfterTime('dayStartTime', {
    message: 'Office Start Time Cannot Be Before Day Start Time'
  })
  officeStartTime!: string

  @Column({ type: 'time' })
  @Matches(/^(?:[0-3][0-9]|4[0-7]):[0-5][0-9](?::[0-5][0-9])?$/, {
    message: 'Office Start Time must match HH:MM[:SS] format'
  })
  @IsAfterTime('officeStartTime', {
    message: 'Office End Time Cannot Be Before Office Start Time'
  })
  officeEndTime!: string

  @Column({ type: 'time' })
  @Matches(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/, {
    message: 'Day Start Time must match HH:MM[:SS] format'
  })
  dayStartTime!: string

  @Column()
  @IsNumber({ allowNaN: false })
  @Min(0)
  absenseDeductionPerDay!: number

  @Column()
  @IsNumber({ allowNaN: false })
  @Min(0)
  lateDeductionPerMinute!: number

  @Column()
  @IsNumber({ allowNaN: false })
  @Min(0)
  overtimeBonusPerMinute!: number

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  @ValidateIf(
    (obj: Employee) =>
      obj.noticePeriod !== null &&
      typeof obj.noticePeriod !== 'undefined' &&
      obj.noticePeriod !== ''
  )
  noticePeriod?: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (obj: Employee) =>
      obj.noticePeriodRemark !== null &&
      typeof obj.noticePeriodRemark !== 'undefined' &&
      obj.noticePeriodRemark !== ''
  )
  noticePeriodRemark?: string

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

  @OneToMany(_type => EmployeeAsset, asset => asset.employee, {
    cascade: true,
    nullable: false,
    eager: true
  })
  @JoinColumn()
  @IsArray()
  @ValidateNested()
  @Type(_ => EmployeeAsset)
  assets!: EmployeeAsset[]

  @OneToMany(_type => EmployeeDocument, document => document.employee, {
    cascade: true,
    nullable: false,
    eager: true
  })
  @JoinColumn()
  @IsArray()
  @ValidateNested()
  @Type(_ => EmployeeDocument)
  documents!: EmployeeDocument[]

  @OneToMany(_type => EmployeeFinancial, financial => financial.employee, {
    cascade: true,
    nullable: false,
    eager: true
  })
  @JoinColumn()
  @IsArray()
  @ValidateNested()
  @Type(_ => EmployeeFinancial)
  financials!: EmployeeFinancial[]

  @OneToMany(_type => EmployeeContact, contact => contact.employee, {
    cascade: true,
    nullable: false,
    eager: true
  })
  @JoinColumn()
  @IsArray()
  @ValidateNested()
  @Type(_ => EmployeeContact)
  contacts!: EmployeeContact[]

  @OneToMany(_type => EmployeeLeave, leave => leave.employee, {
    nullable: false
  })
  @JoinColumn()
  leaves!: EmployeeLeave[] // TODO: non eager as ? optional

  @OneToMany(_type => EmployeeAttendance, attendance => attendance.employee, {
    nullable: false
  })
  @JoinColumn()
  attendances!: EmployeeAttendance[]

  @OneToMany(_type => EmployeeSalary, salary => salary.employee, {
    nullable: false
  })
  @JoinColumn()
  salaries!: EmployeeSalary[]

  @OneToMany(_type => Loan, loan => loan.employee, { nullable: false })
  @JoinColumn()
  loans!: Loan[]
}
