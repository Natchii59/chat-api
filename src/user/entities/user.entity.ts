import { ObjectType, Field } from '@nestjs/graphql'
import { Column, Entity, OneToMany } from 'typeorm'

import { Node } from '@/database/entities/node.entity'
import { Message } from '@/message/entities/message.entity'

@Entity()
@ObjectType()
export class User extends Node {
  @Column({ unique: true })
  @Field(() => String, { description: 'Username of user' })
  username: string

  @Column()
  @Field(() => String, { description: 'Name of user' })
  name: string

  @Column()
  password: string

  @Column({ name: 'resfresh_token', nullable: true })
  refreshToken?: string

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[]
}
