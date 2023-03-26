import { Field, ID, ArgsType } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

import { Message } from '../entities/message.entity'

@ArgsType()
export class DeleteMessageArgs {
  @Field(() => ID, { description: 'Id of message' })
  @IsUUID('4', {
    message: 'The id must be a UUID.'
  })
  id: Message['id']
}
