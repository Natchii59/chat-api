import { Field, ObjectType } from '@nestjs/graphql'
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId
} from 'typeorm'

import { Node } from '@/database/entities/node.entity'
import { Message } from '@/message/entities/message.entity'
import { User } from '@/user/entities/user.entity'

@Entity()
@ObjectType()
export class Conversation extends Node {
  @ManyToOne(() => User, (user) => user.conversations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'creator_id' })
  creator: User

  @RelationId((conversation: Conversation) => conversation.creator)
  creatorId: User['id']

  @ManyToOne(() => User, (user) => user.conversations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User

  @RelationId((conversation: Conversation) => conversation.recipient)
  recipientId: User['id']

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]

  @Column({ name: 'last_message_sent_at', nullable: true })
  @Field(() => Date, { nullable: true })
  lastMessageSentAt?: Date

  @ManyToMany(() => User, (user) => user.closedConversations, {
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'closed_conversations',
    joinColumn: {
      name: 'conversation_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    }
  })
  closedBy: User[]
}
