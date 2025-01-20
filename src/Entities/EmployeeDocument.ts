import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeDocument {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name!: string

  @Column({ length: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  path!: string

  @ManyToOne(_type => Employee, employee => employee.documents, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @Type(_ => Employee)
  employee!: Employee
}
