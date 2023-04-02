import { User } from '@/user/entities/user.entity'

export class UserPayload {
  id: User['id']
}

export class JwtValidatePayload extends UserPayload {
  iat: number
  exp: number
}
