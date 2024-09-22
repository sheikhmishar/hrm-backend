import { Type } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class EmployeeContact {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  phoneNo!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  relation!: string

  @ManyToOne(_type => Employee, employee => employee.contacts, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @Type(_ => Employee)
  employee!: Employee
}
