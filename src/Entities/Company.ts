import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class Company {
  public static STATUSES = ['active', 'inactive'] as const

  // public static tableName = pascalToSnakeCase(Company.name)
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
}
