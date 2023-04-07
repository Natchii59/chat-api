import { ObjectType, Field } from '@nestjs/graphql'
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  RelationId
} from 'typeorm'

import { Conversation } from '@/conversation/entities/conversation.entity'
import { Node } from '@/database/entities/node.entity'
import { Image } from '@/image/entities/image.entity'
import { Message } from '@/message/entities/message.entity'

@Entity()
@ObjectType()
export class User extends Node {
  @Column({ unique: true })
  @Field(() => String, { description: 'Username of user' })
  username: string

  @Column()
  password: string

  @Column({ name: 'resfresh_token', nullable: true })
  refreshToken?: string

  @OneToOne(() => Image, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatar_id' })
  avatar?: Image

  @RelationId((user: User) => user.avatar)
  avatarId?: string

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[]

  @OneToMany(
    () => Conversation,
    (conversation) => conversation.creator || conversation.recipient
  )
  conversations: Conversation[]

  @ManyToMany(() => User, (user) => user.receiverFriends, {
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'user_friends',
    joinColumn: {
      name: 'sender_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'receiver_id',
      referencedColumnName: 'id'
    }
  })
  senderFriends: User[]

  @ManyToMany(() => User, (user) => user.senderFriends, {
    onDelete: 'CASCADE'
  })
  receiverFriends: User[]

  @ManyToMany(() => User, (user) => user.receivedRequests, {
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'user_requests',
    joinColumn: {
      name: 'sender_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'receiver_id',
      referencedColumnName: 'id'
    }
  })
  sentRequests: User[]

  @ManyToMany(() => User, (user) => user.sentRequests, {
    onDelete: 'CASCADE'
  })
  receivedRequests: User[]

  @ManyToMany(() => Conversation, (conversation) => conversation.closedBy, {
    onDelete: 'CASCADE'
  })
  closedConversations: Conversation[]

  @ManyToMany(() => Message, (message) => message.unreadBy, {
    onDelete: 'CASCADE'
  })
  unreadMessages: Message[]
}
