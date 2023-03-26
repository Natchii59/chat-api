import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

import { UserPayload } from '../dto/payload-user.dto'

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super()
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  handleRequest<TUser = UserPayload>(err: Error, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('The refresh token is invalid.')
    }

    return user
  }
}
