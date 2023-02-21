import { InputType, Field, ID } from '@nestjs/graphql'
import { IsUUID, Matches, ValidateIf } from 'class-validator'
import { Transform } from 'class-transformer'

import { User } from '../entities/user.entity'

@InputType()
export class FindOneUserInput {
  @Field(() => ID, { description: 'Username of user', nullable: true })
  @IsUUID('all', {
    message: 'The id must be a UUID.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  id?: User['id']

  @Field(() => String, { description: 'Username of user', nullable: true })
  @Matches(/^[a-zA-Z0-9_]{3,}$/, {
    message:
      'The username must contain at least 3 characters, and can only contain letters, numbers and underscores.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  username?: User['username']
}
