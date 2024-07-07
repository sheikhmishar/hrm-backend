import {
  IsDateString,
  IsEmail,
  IsIn,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length
} from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  // ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import AppDataSource from '../configs/db'
// import Company from './Company'

@Entity()
export default class Employee {
  public static STATUSES = ['active', 'inactive'] as const
  public static GENDERS = ['Male', 'Female', 'Others'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @Index({ unique: true })
  @IsNotEmpty()
  employeeId!: string

  @Column()
  @Length(1, 20)
  name!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string

  @Column()
  @IsOptional()
  @IsString()
  altPhoneNumber!: string

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
  gender!: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  photo?: string

  @Column()
  @IsNotEmpty()
  companyId!: number

  // @IsNotEmpty()
  // @ManyToOne(() => Company, company => company.employees)
  // companyOwned!: Company

  @Column()
  @IsNotEmpty()
  departmentId!: number

  @Column()
  @IsNotEmpty()
  branchId!: number

  @Column()
  @IsNotEmpty()
  designationId!: number

  @Column()
  @IsNotEmpty()
  dutyTypeId!: number

  @Column()
  @IsNotEmpty()
  salaryTypeId!: number

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

  @Column({
    type: 'enum',
    enum: ['applicable', 'notApplicable']
  })
  @IsNotEmpty()
  checkedInLateFee!: string

  @Column({
    type: 'enum',
    enum: ['applicable', 'notApplicable']
  })
  @IsNotEmpty()
  overtime!: string

  @Column({ type: 'date' })
  noticePeriod!: string

  @Column({
    type: 'enum',
    enum: ['applicable', 'notApplicable']
  })
  @IsNotEmpty()
  extraBonus!: string

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active'
  })
  status!: string

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
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
