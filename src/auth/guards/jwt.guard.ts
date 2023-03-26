import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

import { UserPayload } from '../dto/payload-user.dto'
import { IS_PUBLIC_KEY } from '@/utils/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler()
    )

    const ctx = GqlExecutionContext.create(context)
    let { path } = ctx.getInfo()

    while (path.prev) {
      path = path.prev
    }

    if (isPublic || path.key === 'SignIn' || path.key === 'SignUp') return true

    return super.canActivate(context)
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  handleRequest<TUser = UserPayload>(err: Error, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('The access token is invalid.')
    }

    return user
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context)

    return ctx.getContext().req.user
  }
)
