import { ObjectType, Field } from '@nestjs/graphql'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

import { Node } from '@/database/entities/node.entity'
import { Message } from '@/message/entities/message.entity'
import { Conversation } from '@/conversation/entities/conversation.entity'

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

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Avatar of user' })
  avatar: string

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[]

  @ManyToMany(
    () => Conversation,
    (conversation) => conversation.user1 || conversation.user2
  )
  conversations: Conversation[]

  @ManyToMany(() => User, (user) => user.receiverFriends)
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

  @ManyToMany(() => User, (user) => user.senderFriends)
  receiverFriends: User[]

  @ManyToMany(() => User, (user) => user.receivedRequests)
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

  @ManyToMany(() => User, (user) => user.sentRequests)
  receivedRequests: User[]
}
