import { Type } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeFinancial {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  holderName!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  medium!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  accountNumber!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  bankName!: string

  @Column()
  @IsString()
  branch!: string

  @ManyToOne(_type => Employee, employee => employee.financials, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @Type(_ => Employee)
  employee!: Employee
}
