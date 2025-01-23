import { Type } from 'class-transformer'
import {
  IsDate,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min
} from 'class-validator'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import Employee from './Employee'

@Entity()
export default class MonthlySalary {
  static readonly STATUSES = ['Paid', 'Unpaid'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  monthStartDate!: string

  @Column({ type: 'datetime' })
  @IsDate()
  @IsNotEmpty()
  paidAt!: Date

  @Column()
  @IsNumber()
  @Min(0)
  overtime!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  overtimePayment!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  bonus!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  leaveEncashment !: number

  @Column()
  @IsNumber()
  @Min(0)
  late!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  lateDeduction!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  penalty!: number

  @Column()
  @IsNumber()
  @Min(0)
  leave!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  leaveDeduction!: number

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

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  loanDeduction!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  @Min(0)
  totalSalary!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string

  @Column({
    type: 'enum',
    enum: MonthlySalary.STATUSES,
    default: MonthlySalary.STATUSES[1]
  })
  @IsIn([...MonthlySalary.STATUSES, undefined])
  status!: (typeof MonthlySalary.STATUSES)[number]

  @ManyToOne(_type => Employee, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  @Type(_ => Employee)
  employee!: Employee
}
