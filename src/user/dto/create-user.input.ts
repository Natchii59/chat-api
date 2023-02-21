import { InputType, Field } from '@nestjs/graphql'
import { Matches, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

import { User } from '../entities/user.entity'

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Username of user' })
  @Matches(/^[a-zA-Z0-9_]{3,}$/, {
    message:
      'The username must contain at least 3 characters, and can only contain letters, numbers and underscores.'
  })
  @Transform(({ value }) => value.toLowerCase())
  username: User['username']

  @Field(() => String, { description: 'Name of user' })
  @MaxLength(50, {
    message: 'The name must contain at most 50 characters.'
  })
  name: User['name']

  @Field(() => String, { description: 'Password of user' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{12,}$/, {
    message:
      'The password must contain at least 12 characters, and must contain at least one uppercase letter, one lowercase letter, one number and one special character.'
  })
  password: User['password']
}
