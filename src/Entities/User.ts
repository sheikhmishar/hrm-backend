import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import Employee from './Employee'
import { Type } from 'class-transformer'

@Entity()
export default class User {
  public static STATUSES = ['active', 'inactive'] as const
  public static TYPES = ['SuperAdmin', 'HR', 'Employee'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column()
  @Index({ unique: true })
  @IsEmail()
  email!: string

  @Column()
  @Index({ unique: true })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string

  @Column()
  @Length(6, 80)
  password!: string

  @Column({
    type: 'enum',
    enum: User.TYPES,
    default: User.TYPES[1]
  })
  @IsIn([...User.TYPES, undefined])
  type!: (typeof User.TYPES)[number]

  @Column({
    type: 'enum',
    enum: User.STATUSES,
    default: User.STATUSES[1]
  })
  @IsIn([...User.STATUSES, undefined])
  status!: (typeof User.STATUSES)[number]

  @OneToOne(_type => Employee, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  @Type(_ => Employee)
  employee?: Employee
}
