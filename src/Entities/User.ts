import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class User {
  public static TYPES = ['superAdmin', 'admin'] as const

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
}
