import { IsNotEmpty, IsString } from 'class-validator'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export default class Setting {
  @PrimaryColumn()
  @IsString()
  @IsNotEmpty()
  property!: string

  @Column()
  @IsString()
  @IsNotEmpty()
  value!: string
}
