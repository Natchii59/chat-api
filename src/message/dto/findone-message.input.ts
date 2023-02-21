import { Field, ID, ArgsType } from '@nestjs/graphql'
import { IsUUID, ValidateIf } from 'class-validator'

import { Message } from '../entities/message.entity'

@ArgsType()
export class FindOneMessageArgs {
  @Field(() => ID, { description: 'Id of message', nullable: true })
  @IsUUID('all', {
    message: 'The id must be a UUID.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  id?: Message['id']
}
