import { ArgsType, Field, ID } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

@ArgsType()
export class ReadMessagesArgs {
  @Field(() => ID, { description: 'Id of the conversation' })
  @IsUUID('4', { message: 'Conversation id must be a valid UUID' })
  conversationId: string
}
