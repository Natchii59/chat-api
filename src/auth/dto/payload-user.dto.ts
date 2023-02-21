import { User } from '@/user/entities/user.entity'

export class UserPayload {
  id: User['id']
  refreshToken?: User['refreshToken']
}

export class JwtValidatePayload extends UserPayload {
  iat: number
  exp: number
}
