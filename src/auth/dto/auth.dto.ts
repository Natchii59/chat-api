import { ArgsType, Field, ObjectType } from '@nestjs/graphql'

import { User } from '@/user/entities/user.entity'

@ArgsType()
export class SignInArgs {
  @Field(() => String, { description: 'Username of user' })
  username: User['username']

  @Field(() => String, { description: 'Password of user' })
  password: User['password']
}

@ObjectType()
export class TokensOutput {
  @Field(() => String, { description: 'Access Token of user' })
  accessToken: string

  @Field(() => String, { description: 'Access Token of user' })
  refreshToken: User['refreshToken']
}
