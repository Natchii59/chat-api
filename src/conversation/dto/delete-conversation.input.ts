import { Field, ID, ArgsType } from '@nestjs/graphql'
import { IsUUID, ValidateIf } from 'class-validator'

import { Conversation } from '../entities/conversation.entity'

@ArgsType()
export class DeleteConversationArgs {
  @Field(() => ID, { description: 'Id of conversation', nullable: true })
  @IsUUID('all', {
    message: 'The id must be a UUID.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  id?: Conversation['id']
}