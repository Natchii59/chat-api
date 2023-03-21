import { Inject, UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import {
  SignInArgs,
  SignInOutput,
  SignUpOutput,
  TokensOutput
} from './dto/auth.dto'
import { LocalAuthGuard } from './guards/local.guard'
import { UserPayload } from './dto/payload-user.dto'
import { JwtAuthGuard, CurrentUser } from './guards/jwt.guard'
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard'
import { AuthService } from './auth.service'
import { CreateUserInput } from '@/user/dto/create-user.input'
import { UserService } from '@/user/user.service'
import { User } from '@/user/entities/user.entity'
import { Services } from '@/utils/constants'

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(Services.AUTH) private readonly authService: AuthService,
    @Inject(Services.USER) private readonly userService: UserService
  ) {}

  @Mutation(() => SignUpOutput, {
    name: 'SignUp',
    description: 'Sign up User'
  })
  async signUp(@Args('input') input: CreateUserInput): Promise<SignUpOutput> {
    return await this.authService.signUp(input)
  }

  @UseGuards(LocalAuthGuard)
  @Mutation(() => SignInOutput, {
    name: 'SignIn',
    description: 'Sign in User'
  })
  async signIn(
    @Args() _args: SignInArgs,
    @CurrentUser() user: UserPayload
  ): Promise<SignInOutput> {
    return await this.authService.signIn(user)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean, {
    name: 'Logout',
    description: 'Logout current user'
  })
  async logout(@CurrentUser() user: UserPayload): Promise<boolean> {
    await this.authService.logout(user.id)
    return true
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, {
    name: 'Profile',
    description: 'Get current user',
    nullable: true
  })
  async profile(@CurrentUser() currentUser: UserPayload): Promise<User | null> {
    return await this.userService.findOne({
      where: { id: currentUser.id }
    })
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Query(() => TokensOutput, {
    name: 'RefreshTokens',
    description: 'Refresh Tokens of current user'
  })
  async refreshTokens(@CurrentUser() user: UserPayload): Promise<TokensOutput> {
    return await this.authService.refreshTokens(user.id, user.refreshToken)
  }
}
