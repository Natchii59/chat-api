import { ObjectType } from '@nestjs/graphql'
import { Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm'

import { Node } from '@/database/entities/node.entity'
import { User } from '@/user/entities/user.entity'
import { Message } from '@/message/entities/message.entity'

@Entity()
@ObjectType()
export class Conversation extends Node {
  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn({ name: 'user1_id' })
  user1: User

  @RelationId((conversation: Conversation) => conversation.user1)
  user1Id: User['id']

  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn({ name: 'user2_id' })
  user2: User

  @RelationId((conversation: Conversation) => conversation.user2)
  user2Id: User['id']

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]
}
