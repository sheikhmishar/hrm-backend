import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'
import Designation from './Designation'

@Entity()
export default class EmployeeSalary {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'datetime' })
  @IsDate()
  @IsNotEmpty()
  changedAt!: Date

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
  totalSalary!: number

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber({ allowNaN: false })
  taskWisePayment?: number

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber({ allowNaN: false })
  wordLimit?: number

  @ManyToOne(_type => Designation, { nullable: false, eager: true })
  @JoinColumn()
  @IsNotEmpty()
  @Type(_ => Designation)
  designation!: Designation

  @ManyToOne(_type => Employee, employee => employee.salaries, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
