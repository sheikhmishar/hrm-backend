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
  ValidateNested
} from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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
import EmployeeFinancial from './EmployeeFinancial'
import EmployeeLeave from './EmployeeLeave'
import EmployeeSalary from './EmployeeSalary'
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

  @ManyToOne(_type => Branch, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Branch)
  branch!: Branch

  @ManyToOne(_type => Designation, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Designation)
  designation!: Designation

  @ManyToOne(_type => DutyType, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => DutyType)
  dutyType!: DutyType

  @ManyToOne(_type => SalaryType, { nullable: false })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => SalaryType)
  salaryType!: Relation<SalaryType> // TODO:

  @Column({ type: 'date' })
  @IsNotEmpty()
  @IsDateString()
  dateOfJoining!: string

  // TODO: onetomany salaries
  @Column()
  // @Transform(({ value }) => parseInt(value))
  @IsNumber()
  unitSalary!: number

  // TODO: onetoone
  @Column()
  @IsOptional()
  @IsNumber({ allowNaN: false })
  taskWisePayment?: number

  @Column()
  @IsOptional()
  @IsNumber({ allowNaN: false })
  wordLimit?: number

  @Column({ type: 'time' })
  @Matches(/^(?:1[0-2]|0?[1-9]):(?:[0-5]?[0-9])(?::(?:[0-5]?[0-9]))?$/, {
    message: 'Office Start Time must match HH:MM[:SS] format'
  })
  officeStartTime!: string

  @Column({ type: 'time' })
  @Matches(/^(?:1[0-2]|0?[1-9]):(?:[0-5]?[0-9])(?::(?:[0-5]?[0-9]))?$/, {
    message: 'Office Start Time must match HH:MM[:SS] format'
  })
  @IsAfterTime('officeStartTime', {
    message: 'Office Start Time Cannot Be Less Than Office End Time'
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

  @OneToMany(_type => EmployeeAsset, asset => asset.employee, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsArray()
  @ValidateNested()
  @Type(_ => EmployeeAsset)
  assets!: EmployeeAsset[]

  @OneToMany(_type => EmployeeFinancial, financial => financial.employee, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  @IsArray()
  @ValidateNested()
  @Type(_ => EmployeeFinancial)
  financials!: EmployeeFinancial[]

  @OneToMany(_type => EmployeeContact, contact => contact.employee, {
    cascade: true,
    nullable: false
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
  leaves!: EmployeeLeave[]

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
}
