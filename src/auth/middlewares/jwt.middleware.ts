import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { AuthService } from '../auth.service'
import { Services } from '@/utils/constants'

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.AUTH) private readonly authService: AuthService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['accessToken']
    const refreshToken = req.cookies['refreshToken']

    if (!accessToken && !refreshToken) {
      return next()
    }

    try {
      await this.authService.verifyAccessToken(accessToken)
    } catch (err) {
      if (err.status !== 401) {
        return next()
      }

      const dataRefreshToken = await this.authService
        .verifyRefreshToken(refreshToken)
        .catch(() => null)

      if (dataRefreshToken) {
        const data = await this.authService.refreshTokens(dataRefreshToken.id, {
          req,
          res
        })

        req.cookies['accessToken'] = data.accessToken
        req.cookies['refreshToken'] = data.refreshToken
      } else {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
      }
    }

    next()
  }
}
