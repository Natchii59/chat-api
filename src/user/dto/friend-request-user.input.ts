import { Field, ID, ArgsType } from '@nestjs/graphql'
import { IsUUID, Matches } from 'class-validator'

import { User } from '../entities/user.entity'
import { Transform } from 'class-transformer'

@ArgsType()
export class FriendRequesUsertArgs {
  @Field(() => ID, { description: 'Id of user' })
  @IsUUID('all', {
    message: 'The id must be a UUID.'
  })
  id: User['id']
}

@ArgsType()
export class SendFriendRequestArgs {
  @Field(() => String, { description: 'Username of user' })
  @Matches(/^[a-z0-9_]{3,}$/, {
    message:
      'The username must contain at least 3 characters, and can only contain letters, numbers and underscores.'
  })
  @Transform(({ value }) => value.toLowerCase())
  username: User['username']
}
