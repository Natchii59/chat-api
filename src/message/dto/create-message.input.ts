import { InputType, Field, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator'

import { Message } from '../entities/message.entity'
import { Conversation } from '@/conversation/entities/conversation.entity'

@InputType()
export class CreateMessageInput {
  @Field(() => String, { description: 'Content of the message' })
  @IsNotEmpty({ message: 'Message content is required' })
  @MaxLength(1000, { message: 'Message content is too long' })
  content: Message['content']

  @Field(() => ID, { description: 'ID of the conversation' })
  @IsUUID('4', { message: 'The id must be a UUID.' })
  conversationId: Conversation['id']
}
