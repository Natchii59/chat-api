import { Field, ID, ObjectType } from '@nestjs/graphql'

import { Message } from '@/message/entities/message.entity'
import { User } from '@/user/entities/user.entity'

@ObjectType()
export class UserConversation extends User {
  @Field(() => ID, {
    description: 'Get the id of the first unread message of the conversation.',
    nullable: true
  })
  firstUnreadMessageId?: Message['id']

  @Field(() => Number, {
    description: 'Get the count of unread messages of the conversation.'
  })
  unreadMessagesCount: number
}
