import { Inject, UnauthorizedException } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { GatewaySessionManager } from './gateway.session'
import { AuthService } from '@/auth/auth.service'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'
import { Message } from '@/message/entities/message.entity'
import { Conversation } from '@/conversation/entities/conversation.entity'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173']
  }
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly sessions: GatewaySessionManager,
    @Inject(Services.AUTH) private readonly authService: AuthService,
    @Inject(Services.USER) private readonly userService: UserService,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  @WebSocketServer()
  server: Server

  async handleConnection(socket: Socket) {
    try {
      const userPayload = await this.authService.verifyAccessToken(
        socket.handshake.headers.authorization
      )
      const user = await this.userService.findOne({ id: userPayload.id })

      if (!user) {
        return this.disconnect(socket)
      }

      socket.data.user = user
      this.sessions.setUserSocket(user.id, socket)
    } catch (err) {
      socket.emit('error', new UnauthorizedException())
      return this.disconnect(socket)
    }
  }

  handleDisconnect(socket: Socket) {
    this.disconnect(socket)
  }

  private disconnect(socket: Socket) {
    if (socket.data.user) {
      this.sessions.removeUserSocket(socket.data.user.id)
    }
    socket.disconnect()
  }

  @SubscribeMessage('createMessage')
  async handleMessageCreate(@MessageBody() body: Message) {
    this.server
      .to(`conversation-${body.conversation.id}`)
      .emit('onMessage', body)

    this.sessions
      .getUserSocket(body.conversation.user1.id)
      ?.emit('onMessageUpdateConversationSideBar', body)
    this.sessions
      .getUserSocket(body.conversation.user2.id)
      ?.emit('onMessageUpdateConversationSideBar', body)
  }

  @SubscribeMessage('onConversationJoin')
  async onConversationJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`conversation-${data.conversationId}`)
    socket.to(`conversation-${data.conversationId}`).emit('userJoin')
  }

  @SubscribeMessage('onConversationLeave')
  async onConversationLeave(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(`conversation-${data.conversationId}`)
    socket.to(`conversation-${data.conversationId}`).emit('userLeave')
  }
}
