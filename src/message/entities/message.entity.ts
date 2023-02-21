import { ObjectType, Field, ID } from '@nestjs/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId
} from 'typeorm'

import { User } from '@/user/entities/user.entity'

@Entity()
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique identifier for the message' })
  id: string

  @Column()
  @Field(() => String, { description: 'Content of the message' })
  content: string

  @CreateDateColumn({ name: 'created_at' })
  @Field(() => Date, { description: 'Date when the message was created' })
  createdAt: Date

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @RelationId((message: Message) => message.user)
  userId: User['id']
}
