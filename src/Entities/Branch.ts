import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class Branch {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: Branch.STATUSES,
    default: Branch.STATUSES[0]
  })
  @IsIn([...Branch.STATUSES, undefined])
  status!: (typeof Branch.STATUSES)[number]

  @OneToMany(() => Employee, employee => employee.company)
  employees!: Employee[]
}
