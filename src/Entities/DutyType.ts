import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import Employee from './Employee'

@Entity()
export default class DutyType {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: DutyType.STATUSES,
    default: DutyType.STATUSES[0]
  })
  @IsIn([...DutyType.STATUSES, undefined])
  status!: (typeof DutyType.STATUSES)[number]

  @OneToMany(() => Employee, employee => employee.company)
  employees!: Employee[]
}
