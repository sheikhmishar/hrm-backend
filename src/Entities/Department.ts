import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class Department {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: Department.STATUSES,
    default: Department.STATUSES[0]
  })
  @IsIn([...Department.STATUSES, undefined])
  status!: (typeof Department.STATUSES)[number]

  @OneToMany(() => Employee, employee => employee.company)
  employees!: Employee[]
}
