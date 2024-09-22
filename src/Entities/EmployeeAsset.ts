import { Type } from 'class-transformer'
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeAsset {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  description!: string

  @Column({ type: 'date' })
  @IsDateString()
  @IsNotEmpty()
  givenDate!: string

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  returnDate?: string

  @ManyToOne(_type => Employee, employee => employee.assets, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @Type(_ => Employee)
  employee!: Employee
}
