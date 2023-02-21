import { Field, InputType } from '@nestjs/graphql'
import { Matches, MaxLength, ValidateIf } from 'class-validator'
import { Transform } from 'class-transformer'

import { User } from '../entities/user.entity'

@InputType()
export class UpdateUserInput {
  @Field(() => String, { description: 'Username of user', nullable: true })
  @Matches(/^[a-zA-Z0-9_]{3,}$/, {
    message:
      'The username must contain at least 3 characters, and can only contain letters, numbers and underscores.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  username?: User['username']

  @Field(() => String, { description: 'Name of user', nullable: true })
  @MaxLength(50, {
    message: 'The name must contain at most 50 characters.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  name?: User['name']

  @Field(() => String, { description: 'Password of user', nullable: true })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{12,}$/, {
    message:
      'The password must contain at least 12 characters, and must contain at least one uppercase letter, one lowercase letter, one number and one special character.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  password?: User['password']

  refreshToken?: User['refreshToken']
}
