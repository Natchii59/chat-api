import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'

import { User } from '@/user/entities/user.entity'

@Injectable()
export class GatewaySessionManager {
  private readonly sessions: Map<User['id'], Socket> = new Map()

  getUserSocket(id: User['id']): Socket {
    return this.sessions.get(id)
  }

  setUserSocket(userId: User['id'], socket: Socket): void {
    this.sessions.set(userId, socket)
  }

  removeUserSocket(userId: User['id']): void {
    this.sessions.delete(userId)
  }

  getSockets(): Map<User['id'], Socket> {
    return this.sessions
  }
}
