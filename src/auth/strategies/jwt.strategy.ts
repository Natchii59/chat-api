import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtValidatePayload, UserPayload } from '../dto/payload-user.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCES_TOKEN_SECRET
    })
  }

  validate(payload: JwtValidatePayload): UserPayload {
    return {
      id: payload.id
    }
  }
}
