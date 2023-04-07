import { ObjectType, Field, ID } from '@nestjs/graphql'
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

import { Conversation } from '@/conversation/entities/conversation.entity'
import { Node } from '@/database/entities/node.entity'
import { User } from '@/user/entities/user.entity'

@Entity()
@ObjectType()
export class Message extends Node {
  @Column()
  @Field(() => String, { description: 'Content of the message' })
  content: string

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Whether the message is modified' })
  isModified: boolean

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

  @ManyToMany(() => User, (user) => user.unreadMessages)
  @JoinTable({
    name: 'user_unread_messages',
    joinColumn: {
      name: 'message_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    }
  })
  unreadBy: User[]

  @RelationId((message: Message) => message.unreadBy)
  @Field(() => [ID], {
    description: 'Ids of users who have not read the message'
  })
  unreadByIds: User['id'][]

  @ManyToOne(() => Message, (message) => message.replies, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'reply_to_id' })
  replyTo: Message

  @RelationId((message: Message) => message.replyTo)
  replyToId: Message['id']

  @OneToMany(() => Message, (message) => message.replyTo)
  replies: Message[]
}
