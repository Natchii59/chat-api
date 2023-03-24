import { Field, ID, ArgsType } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

import { Conversation } from '../entities/conversation.entity'

@ArgsType()
export class CloseConversationArgs {
  @Field(() => ID, { description: 'Id of conversation' })
  @IsUUID('all', {
    message: 'The id must be a UUID.'
  })
  id: Conversation['id']
}
