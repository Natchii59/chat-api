import { InputType, Field, ID, ObjectType } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

import { User } from '@/user/entities/user.entity'
import { Conversation } from '../entities/conversation.entity'

@InputType()
export class CreateConversationInput {
  @Field(() => ID, {
    description: 'The user that will be part of the conversation.'
  })
  @IsUUID('all', { message: 'Invalid user Id.' })
  userId: User['id']
}

@ObjectType()
export class CreateConversationOutput {
  @Field(() => Conversation, {
    description: 'The conversation created.'
  })
  conversation: Conversation

  @Field(() => Boolean, {
    description: 'Whether the conversation was created or not.',
    defaultValue: true
  })
  created?: boolean
}
