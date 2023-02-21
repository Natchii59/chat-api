import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtValidatePayload, UserPayload } from '../dto/payload-user.dto'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback: true
    })
  }

  validate(req: Request, payload: JwtValidatePayload): UserPayload {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim()

    return { ...payload, refreshToken }
  }
}
