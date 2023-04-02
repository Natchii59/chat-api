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
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJwtFromCookies
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET
    })
  }

  private static extractJwtFromCookies(req: Request): string | null {
    if (
      req.cookies &&
      'refreshToken' in req.cookies &&
      req.cookies['refreshToken'].length > 0
    ) {
      return req.cookies['refreshToken']
    }

    return null
  }

  validate(payload: JwtValidatePayload): UserPayload {
    if (!payload) return null

    return {
      id: payload.id
    }
  }
}
