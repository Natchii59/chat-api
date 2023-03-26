import { InputType, Field, ID } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsUUID, Matches, ValidateIf } from 'class-validator'

import { User } from '../entities/user.entity'

@InputType()
export class FindOneUserInput {
  @Field(() => ID, { description: 'Id of user', nullable: true })
  @IsUUID('4', {
    message: 'The id must be a UUID.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  id?: User['id']

  @Field(() => String, { description: 'Username of user', nullable: true })
  @Matches(/^[a-z0-9_]{3,}$/, {
    message:
      'The username must be at least 3 characters long and can only contain lowercase letters, numbers and underscores.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  username?: User['username']
}
