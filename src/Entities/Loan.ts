import { Type } from 'class-transformer'
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class Loan {
  @PrimaryGeneratedColumn()
  public id!: number

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  @IsNumber()
  amount!: number

  @Column({ type: 'date' })
  @IsDateString()
  date!: string

  @ManyToOne(_type => Employee, employee => employee.loans, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @IsNotEmpty()
  @Type(_ => Employee)
  employee!: Employee
}
