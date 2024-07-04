import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export const USER_TYPES = ['superAdmin', 'admin'] as const

@Entity()
export default class User {
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
    enum: USER_TYPES,
    default: USER_TYPES[1]
  })
  @IsIn([...USER_TYPES, undefined])
  type!: (typeof USER_TYPES)[number]
}
