import { Inject } from '@nestjs/common'
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

import { GatewaySessionManager } from './gateway.session'
import { AuthService } from '@/auth/auth.service'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { Message } from '@/message/entities/message.entity'
import { MessageService } from '@/message/message.service'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@WebSocketGateway({
  cors: {
    origin: [process.env.CLIENT_URL]
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
    @Inject(Services.MESSAGE)
    private readonly messageService: MessageService
  ) {}

  @WebSocketServer()
  server: Server

  async handleConnection(socket: Socket) {
    try {
      const userPayload = await this.authService.verifyAccessToken(
        socket.handshake.auth.token
      )
      const user = await this.userService.findOne({
        where: { id: userPayload.id },
        select: ['id', 'username', 'createdAt'],
        relations: ['avatar']
      })

      if (!user) {
        return this.disconnect(socket)
      }

      socket.data.user = user
      this.sessions.setUserSocket(user.id, socket)

      console.log('connected', socket.id)
      console.log(this.sessions.getSockets().size, 'sessions')
    } catch (err) {
      return this.disconnect(socket)
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnected', socket.id)
    this.disconnect(socket)
    console.log(this.sessions.getSockets().size, 'sessions')
  }

  private disconnect(socket: Socket) {
    if (socket.data.user) {
      this.sessions.removeUserSocket(socket.data.user.id)
    }
    socket.disconnect()
  }

  @SubscribeMessage('createMessage')
  async createMessage(@MessageBody() data: { message: Message }) {
    console.log(
      `${data.message.user.username} send message to ${data.message.conversation.id}`
    )

    this.server
      .to(`conversation-${data.message.conversation.id}`)
      .emit('onMessageCreated', { message: data.message })

    this.sessions
      .getUserSocket(data.message.conversation.user1.id)
      ?.emit('onMessageCreatedSidebar', { message: data.message })
    this.sessions
      .getUserSocket(data.message.conversation.user2.id)
      ?.emit('onMessageCreatedSidebar', { message: data.message })
  }

  @SubscribeMessage('updateMessage')
  async updateMessage(
    @MessageBody()
    data: {
      message: Message
      conversationId: string
      user1Id: string
      user2Id: string
    }
  ) {
    console.log(
      `${data.message.user.username} update message ${data.message.id} in conversation ${data.conversationId}`
    )

    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('onMessageUpdated', { message: data.message })

    this.sessions.getUserSocket(data.user1Id)?.emit('onMessageUpdatedSidebar', {
      message: data.message,
      conversationId: data.conversationId
    })
    this.sessions.getUserSocket(data.user2Id)?.emit('onMessageUpdatedSidebar', {
      message: data.message,
      conversationId: data.conversationId
    })
  }

  @SubscribeMessage('deleteMessage')
  async onMessageDeleted(
    @MessageBody()
    data: {
      conversationId: string
      messageId: string
      user1Id: string
      user2Id: string
    },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} delete message ${data.messageId} from conversation ${data.conversationId}`
    )

    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('onMessageDeleted', {
        messageId: data.messageId
      })

    const newLastMessage = await this.messageService.findOne({
      where: { conversation: { id: data.conversationId } },
      order: { createdAt: 'DESC' }
    })

    this.sessions.getUserSocket(data.user1Id)?.emit('onMessageDeletedSidebar', {
      conversationId: data.conversationId,
      newLastMessage
    })
    this.sessions.getUserSocket(data.user2Id)?.emit('onMessageDeletedSidebar', {
      conversationId: data.conversationId,
      newLastMessage
    })
  }

  @SubscribeMessage('onConversationJoin')
  async onConversationJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(`${socket.data.user.username} join ${data.conversationId}`)

    socket.join(`conversation-${data.conversationId}`)
    socket.to(`conversation-${data.conversationId}`).emit('userJoin')
  }

  @SubscribeMessage('onConversationLeave')
  async onConversationLeave(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(`${socket.data.user.username} leave ${data.conversationId}`)

    socket.leave(`conversation-${data.conversationId}`)
    socket.to(`conversation-${data.conversationId}`).emit('userLeave')
  }

  @SubscribeMessage('onTypingStart')
  async onTypingStart(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} start typing ${data.conversationId}`
    )

    socket.to(`conversation-${data.conversationId}`).emit('onTypingStart')

    const userSocket = this.sessions.getUserSocket(data.userId)
    if (userSocket) {
      userSocket.emit('onTypingStartConversation', {
        conversationId: data.conversationId
      })
    }
  }

  @SubscribeMessage('onTypingStop')
  async onTypingStop(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} stop typing ${data.conversationId}`
    )

    socket.to(`conversation-${data.conversationId}`).emit('onTypingStop')

    const userSocket = this.sessions.getUserSocket(data.userId)
    if (userSocket) {
      userSocket.emit('onTypingStopConversation', {
        conversationId: data.conversationId
      })
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} accept friend request ${data.userId}`
    )

    const userSocket = this.sessions.getUserSocket(data.userId)

    if (userSocket) {
      userSocket.emit('onFriendRequestAccepted', {
        userId: socket.data.user.id
      })
    }

    const currentUserSocket = this.sessions.getUserSocket(socket.data.user.id)

    if (currentUserSocket) {
      currentUserSocket.emit('onFriendRequestAccepted', {
        userId: data.userId
      })
    }
  }

  @SubscribeMessage('declineFriendRequest')
  async declineFriendRequest(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} decline friend request ${data.userId}`
    )

    const userSocket = this.sessions.getUserSocket(data.userId)

    if (userSocket) {
      userSocket.emit('onFriendRequestDeclined', {
        userId: socket.data.user.id
      })
    }

    const currentUserSocket = this.sessions.getUserSocket(socket.data.user.id)

    if (currentUserSocket) {
      currentUserSocket.emit('onFriendRequestDeclined', {
        userId: data.userId
      })
    }
  }

  @SubscribeMessage('cancelFriendRequest')
  async cancelFriendRequest(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} cancel friend request ${data.userId}`
    )

    const userSocket = this.sessions.getUserSocket(data.userId)

    if (userSocket) {
      userSocket.emit('onFriendRequestCanceled', {
        userId: socket.data.user.id
      })
    }

    const currentUserSocket = this.sessions.getUserSocket(socket.data.user.id)

    if (currentUserSocket) {
      currentUserSocket.emit('onFriendRequestCanceled', {
        userId: data.userId
      })
    }
  }

  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    @MessageBody() data: { user: User },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} send friend request ${data.user.username}`
    )

    const userSocket = this.sessions.getUserSocket(data.user.id)

    if (userSocket) {
      userSocket.emit('onFriendRequestSentReceived', {
        user: socket.data.user
      })
    }

    const currentUserSocket = this.sessions.getUserSocket(socket.data.user.id)

    if (currentUserSocket) {
      currentUserSocket.emit('onFriendRequestSentSended', {
        user: data.user
      })
    }
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(`${socket.data.user.username} remove friend ${data.userId}`)

    const userSocket = this.sessions.getUserSocket(data.userId)

    if (userSocket) {
      userSocket.emit('onFriendRemoved', {
        userId: socket.data.user.id
      })
    }

    const currentUserSocket = this.sessions.getUserSocket(socket.data.user.id)

    if (currentUserSocket) {
      currentUserSocket.emit('onFriendRemoved', {
        userId: data.userId
      })
    }
  }

  @SubscribeMessage('createConversation')
  async createConversation(
    @MessageBody() data: { conversation: Conversation }
  ) {
    console.log(
      `${data.conversation.user1.username} create conversation with ${data.conversation.user2.username}`
    )

    this.sessions
      .getUserSocket(data.conversation.user1.id)
      ?.emit('onConversationCreated', { conversation: data.conversation })
    this.sessions
      .getUserSocket(data.conversation.user2.id)
      ?.emit('onConversationCreated', { conversation: data.conversation })
  }
}
