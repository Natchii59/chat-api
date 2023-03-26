import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from '../auth.service'
import { UserPayload } from '../dto/payload-user.dto'
import { User } from '@/user/entities/user.entity'
import { Services } from '@/utils/constants'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Services.AUTH) private readonly authService: AuthService
  ) {
    super()
  }

  async validate(
    username: User['username'],
    password: User['password']
  ): Promise<UserPayload> {
    const user = await this.authService.validateUser(username, password)

    if (!user) throw new UnauthorizedException('Invalid credentials.')

    return user
  }
}
