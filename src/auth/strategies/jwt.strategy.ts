import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtValidatePayload, UserPayload } from '../dto/payload-user.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwtFromCookies
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCES_TOKEN_SECRET
    })
  }

  private static extractJwtFromCookies(req: Request): string | null {
    if (
      req.cookies &&
      'accessToken' in req.cookies &&
      req.cookies['accessToken'].length > 0
    ) {
      return req.cookies['accessToken']
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
