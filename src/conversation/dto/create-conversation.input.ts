import { InputType, Field, ID } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

import { User } from '@/user/entities/user.entity'

@InputType()
export class CreateConversationInput {
  @Field(() => ID, {
    description: 'The user that will be part of the conversation.'
  })
  @IsUUID('all', { message: 'Invalid user Id.' })
  userId: User['id']
}
