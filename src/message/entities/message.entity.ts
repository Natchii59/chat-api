import { ObjectType, Field } from '@nestjs/graphql'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'

import { Conversation } from '@/conversation/entities/conversation.entity'
import { Node } from '@/database/entities/node.entity'
import { User } from '@/user/entities/user.entity'

@Entity()
@ObjectType()
export class Message extends Node {
  @Column()
  @Field(() => String, { description: 'Content of the message' })
  content: string

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @RelationId((message: Message) => message.user)
  userId: User['id']

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation

  @RelationId((message: Message) => message.conversation)
  conversationId: Conversation['id']
}
