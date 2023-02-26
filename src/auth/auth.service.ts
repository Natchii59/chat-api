import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'

import { UserPayload } from './dto/payload-user.dto'
import { SignInOutput, SignUpOutput, TokensOutput } from './dto/auth.dto'
import { User } from '@/user/entities/user.entity'
import { CreateUserInput } from '@/user/dto/create-user.input'
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
    const user = await this.userService.findOne({ username })

    if (user && (await compare(password, user.password))) {
      return {
        id: user.id
      }
    }

    return null
  }

  async signUp(input: CreateUserInput): Promise<SignUpOutput> {
    const user = await this.userService.create(input)

    const tokens = await this.getTokens({
      id: user.id
    })

    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user
    }
  }

  async signIn(payload: UserPayload): Promise<SignInOutput> {
    const tokens = await this.getTokens(payload)
    await this.updateRefreshToken(payload.id, tokens.refreshToken)

    const user = await this.userService.findOne({ id: payload.id })

    return {
      ...tokens,
      user
    }
  }

  async logout(id: User['id']): Promise<void> {
    await this.userService.update(id, { refreshToken: null })
  }

  async getTokens(payload: UserPayload): Promise<TokensOutput> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: '1h'
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: '1y'
      })
    ])

    return {
      accessToken,
      refreshToken
    }
  }

  async updateRefreshToken(
    id: User['id'],
    refreshToken: User['refreshToken']
  ): Promise<void> {
    refreshToken = await hashData(refreshToken)
    await this.userService.update(id, { refreshToken })
  }

  async refreshTokens(
    id: User['id'],
    refreshToken: User['refreshToken']
  ): Promise<TokensOutput> {
    const user = await this.userService.findOne({ id })

    if (!user) throw new NotFoundException()

    if (!user.refreshToken) throw new UnauthorizedException()

    const matchTokens = await compare(refreshToken, user.refreshToken)

    if (!matchTokens) throw new UnauthorizedException()

    const tokens = await this.getTokens({
      id: user.id
    })

    await this.updateRefreshToken(id, tokens.refreshToken)

    return tokens
  }

  async verifyAccessToken(token: string): Promise<UserPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET
      })
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
