import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { pascalToSnakeCase } from '../utils/misc'
import Employee from './Employee'

@Entity()
export default class Company {
  public static STATUSES = ['active', 'inactive'] as const

  public static tableName = pascalToSnakeCase(Company.name)
  // public static SQL = { // TODO
  //   TABLE_NAME: pascalToSnakeCase(Company.name),
  //   ['name' satisfies keyof Company]: pascalToSnakeCase('name')
  // }

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  logo?: string

  @Column({
    type: 'enum',
    enum: Company.STATUSES,
    default: Company.STATUSES[0]
  })
  @IsIn([...Company.STATUSES, undefined])
  status!: (typeof Company.STATUSES)[number]

  @OneToMany(() => Employee, employee => employee.company)
  employees!: Employee[]
}
