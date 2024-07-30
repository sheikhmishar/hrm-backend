import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class Designation {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: Designation.STATUSES,
    default: Designation.STATUSES[0]
  })
  @IsIn([...Designation.STATUSES, undefined])
  status!: (typeof Designation.STATUSES)[number]

  @OneToMany(() => Employee, employee => employee.company)
  employees!: Employee[]
}
