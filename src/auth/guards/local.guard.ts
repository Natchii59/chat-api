import {
  BadRequestException,
  ExecutionContext,
  Injectable
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { matches } from 'class-validator'

import { SignInArgs } from '../dto/auth.dto'
import { IGraphQLErrorMessage } from '@/utils/types'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const gqlReq = ctx.getContext().req

    if (gqlReq) {
      const args = ctx.getArgs()
      this.validateArgs(args)

      gqlReq.body = args
      return gqlReq
    }

    return context.switchToHttp().getRequest()
  }

  validateArgs(args: SignInArgs): void {
    const errors: IGraphQLErrorMessage[] = []

    if (!matches(args.username, /^[a-z0-9_]{3,}$/))
      errors.push({
        code: 'username',
        message:
          'The username must contain at least 3 characters, and must contain only lowercase letters, numbers and underscores.'
      })

    if (
      !matches(args.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{12,}$/)
    )
      errors.push({
        code: 'password',
        message:
          'The password must contain at least 12 characters, and must contain at least one uppercase letter, one lowercase letter, one number and one special character.'
      })

    if (errors.length) throw new BadRequestException(errors)
  }
}
