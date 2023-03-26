import { Field, InputType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { Matches, ValidateIf } from 'class-validator'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'

import { User } from '../entities/user.entity'
import { FileUpload } from '@/utils/types'

@InputType()
export class UpdateUserInput {
  @Field(() => String, { description: 'Username of user', nullable: true })
  @Matches(/^[a-z0-9_]{3,}$/, {
    message:
      'The username must be at least 3 characters long and can only contain lowercase letters, numbers and underscores.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  username?: User['username']

  @Field(() => String, { description: 'Password of user', nullable: true })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{12,}$/, {
    message:
      'The password must contain at least 12 characters, and must contain at least one uppercase letter, one lowercase letter, one number and one special character.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  password?: User['password']

  @Field(() => GraphQLUpload, { description: 'Avatar of user', nullable: true })
  avatar?: Promise<FileUpload>

  refreshToken?: User['refreshToken']
}
