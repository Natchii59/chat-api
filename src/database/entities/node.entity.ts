import { Field, ID, InterfaceType } from '@nestjs/graphql'
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@InterfaceType({ isAbstract: true })
export abstract class Node {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique identifier for the resource.' })
  id: string

  @CreateDateColumn({ name: 'created_at' })
  @Field(() => Date, {
    description: 'Date and time when the resource was created.'
  })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  @Field(() => Date, {
    description: 'Date and time when the resource was last updated.'
  })
  updatedAt: Date
}
