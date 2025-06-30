import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class BonusType {
  public static STATUSES = ['active', 'inactive'] as const

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string

  @Column({
    type: 'enum',
    enum: BonusType.STATUSES,
    default: BonusType.STATUSES[0]
  })
  @IsIn([...BonusType.STATUSES, undefined])
  status!: (typeof BonusType.STATUSES)[number]
}
