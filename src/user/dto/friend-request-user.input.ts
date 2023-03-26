import { Field, ID, ArgsType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsUUID, Matches } from 'class-validator'

import { User } from '../entities/user.entity'

@ArgsType()
export class FriendRequesUsertArgs {
  @Field(() => ID, { description: 'Id of user' })
  @IsUUID('4', {
    message: 'The id must be a UUID.'
  })
  id: User['id']
}

@ArgsType()
export class SendFriendRequestArgs {
  @Field(() => String, { description: 'Username of user' })
  @Matches(/^[a-z0-9_]{3,}$/, {
    message:
      'The username must be at least 3 characters long and can only contain lowercase letters, numbers and underscores.'
  })
  @Transform(({ value }) => value.toLowerCase())
  username: User['username']
}
