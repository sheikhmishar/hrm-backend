import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator'
import {
  Column,
  Entity,
  // ManyToOne,
  // OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { pascalToSnakeCase } from '../utils/misc'
// import { Employee } from './Employee'

export const COMPANY_STATUSES = ['active', 'inactive'] as const

@Entity()
export default class Company {
  public static tableName = pascalToSnakeCase(Company.name)
  // public static SQL = {
  //   TABLE_NAME: pascalToSnakeCase(Company.name),
  //   ['name' satisfies keyof Company]: pascalToSnakeCase('name')
  // }

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column()
  @IsOptional()
  @IsString()
  logo!: string

  @Column({
    type: 'enum',
    enum: COMPANY_STATUSES,
    default: COMPANY_STATUSES[0]
  })
  @IsIn([...COMPANY_STATUSES, undefined])
  status!: (typeof COMPANY_STATUSES)[number]

  // @OneToMany(() => Employee, employee => employee.company)
  // employees!: Employee[]
}
