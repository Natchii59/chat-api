import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'
import { Request, Response } from 'express'

import { TokensOutput } from './dto/auth.dto'
import { UserPayload } from './dto/payload-user.dto'
import { CreateUserInput } from '@/user/dto/create-user.input'
import { User } from '@/user/entities/user.entity'
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'
import { hashData } from '@/utils/functions'

@Injectable()
export class AuthService {
  constructor(
    @Inject(Services.USER) private readonly userService: UserService,
    @Inject(JwtService) private readonly jwtService: JwtService
  ) {}

  async validateUser(
    username: User['username'],
    password: User['password']
  ): Promise<UserPayload | null> {
    const user = await this.userService.findOne({
      where: { username }
    })

    if (user && (await compare(password, user.password))) {
      return {
        id: user.id
      }
    }

    return null
  }

  async signUp(input: CreateUserInput, res: Response): Promise<User> {
    const user = await this.userService.create(input)

    const tokens = await this.getTokens({
      id: user.id
    })

    await this.updateRefreshToken(user.id, tokens.refreshToken)

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    return user
  }

  async signIn(payload: UserPayload, res: Response): Promise<User> {
    const tokens = await this.getTokens(payload)
    await this.updateRefreshToken(payload.id, tokens.refreshToken)

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    return await this.userService.findOne({
      where: { id: payload.id }
    })
  }

  async logout(id: User['id'], res: Response): Promise<void> {
    await this.updateRefreshToken(id, null)
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
  }

  async getTokens(payload: UserPayload): Promise<TokensOutput> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: '1h'
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: '7d'
      })
    ])

    return {
      accessToken,
      refreshToken
    }
  }

  async updateRefreshToken(
    id: User['id'],
    refreshToken: User['refreshToken'] | null
  ): Promise<void> {
    if (refreshToken) refreshToken = await hashData(refreshToken)
    await this.userService.update(id, { refreshToken })
  }

  async refreshTokens(
    id: User['id'],
    context: { req: Request; res: Response }
  ): Promise<TokensOutput> {
    const user = await this.userService.findOne({
      where: { id }
    })

    if (!user) throw new UserNotFoundException()

    const refreshToken = context.req.cookies['refreshToken']

    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not provided.')

    const matchTokens = await compare(refreshToken, user.refreshToken)

    if (!matchTokens) throw new UnauthorizedException('Invalid refresh token.')

    const tokens = await this.getTokens({
      id: user.id
    })

    await this.updateRefreshToken(id, tokens.refreshToken)

    context.res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    context.res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    return tokens
  }

  async verifyAccessToken(token: string): Promise<UserPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET
      })
    } catch (error) {
      throw new UnauthorizedException('Invalid token.')
    }
  }

  async verifyRefreshToken(token: string): Promise<UserPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET
      })
    } catch (error) {
      throw new UnauthorizedException('Invalid token.')
    }
  }
}
