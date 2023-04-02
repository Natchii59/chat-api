import { Inject, UseGuards } from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { SignInArgs, TokensOutput } from './dto/auth.dto'
import { UserPayload } from './dto/payload-user.dto'
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard'
import { JwtAuthGuard, CurrentUser } from './guards/jwt.guard'
import { LocalAuthGuard } from './guards/local.guard'
import { CreateUserInput } from '@/user/dto/create-user.input'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(Services.AUTH) private readonly authService: AuthService,
    @Inject(Services.USER) private readonly userService: UserService
  ) {}

  @Mutation(() => User, {
    name: 'SignUp',
    description: 'Sign up User'
  })
  async signUp(
    @Args('input') input: CreateUserInput,
    @Context('res') res: Response
  ): Promise<User> {
    return await this.authService.signUp(input, res)
  }

  @UseGuards(LocalAuthGuard)
  @Mutation(() => User, {
    name: 'SignIn',
    description: 'Sign in User'
  })
  async signIn(
    @Args() _args: SignInArgs,
    @CurrentUser() user: UserPayload,
    @Context('res') res: Response
  ): Promise<User> {
    return await this.authService.signIn(user, res)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean, {
    name: 'Logout',
    description: 'Logout current user'
  })
  async logout(
    @CurrentUser() user: UserPayload,
    @Context('res') res: Response
  ): Promise<boolean> {
    await this.authService.logout(user.id, res)
    return true
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, {
    name: 'Profile',
    description: 'Get current user'
  })
  async profile(@CurrentUser() currentUser: UserPayload): Promise<User> {
    return await this.userService.findOne({
      where: { id: currentUser.id }
    })
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Mutation(() => TokensOutput, {
    name: 'RefreshTokens',
    description: 'Refresh Tokens of current user'
  })
  async refreshTokens(
    @CurrentUser() user: UserPayload,
    @Context('req') req: Request,
    @Context('res') res: Response
  ): Promise<TokensOutput> {
    return await this.authService.refreshTokens(user.id, { req, res })
  }
}
