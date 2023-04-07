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
import { parse } from 'cookie'
import { Server, Socket } from 'socket.io'

import { AuthService } from '@/auth/auth.service'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { Message } from '@/message/entities/message.entity'
import { MessageService } from '@/message/message.service'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@WebSocketGateway({
  cors: {
    origin: [process.env.CLIENT_URL],
    credentials: true
  }
})
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(Services.AUTH) private readonly authService: AuthService,
    @Inject(Services.USER) private readonly userService: UserService,
    @Inject(Services.MESSAGE)
    private readonly messageService: MessageService
  ) {}

  @WebSocketServer()
  server: Server

  async handleConnection(socket: Socket) {
    try {
      const { cookie: rawCookie } = socket.handshake.headers
      const cookie = parse(rawCookie)

      const token = cookie['accessToken']

      const userPayload = await this.authService.verifyAccessToken(token)
      const user = await this.userService.findOne({
        where: { id: userPayload.id },
        select: ['id', 'username', 'createdAt'],
        relations: ['avatar']
      })

      if (!user) {
        return this.disconnect(socket)
      }

      socket.data.user = user
      socket.join(`user-${user.id}`)

      console.log('connected', socket.id)
    } catch (err) {
      return this.disconnect(socket)
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnected', socket.id)
    this.disconnect(socket)
  }

  private async disconnect(socket: Socket) {
    if (socket.data.user) {
      socket.leave(`user-${socket.data.user.id}`)

      const friends = await this.userService.findAllFriends(socket.data.user.id)
      if (friends.length) {
        this.server
          .to(friends.map((friend) => `user-${friend.id}`))
          .emit('onFriendsStatusDisconnected', {
            userId: socket.data.user.id
          })
      }
    }
    socket.disconnect()
  }

  @SubscribeMessage('createMessage')
  async createMessage(
    @MessageBody()
    data: {
      message: Message
    },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${data.message.user.username} send message to ${data.message.conversation.id}`
    )

    const otherUserId =
      data.message.conversation.creator.id === data.message.user.id
        ? data.message.conversation.recipient.id
        : data.message.conversation.creator.id

    this.server
      .to(`conversation-${data.message.conversation.id}`)
      .emit('onMessageCreated', {
        message: data.message
      })

    this.server
      .to(`user-${socket.data.user.id}`)
      .to(`user-${otherUserId}`)
      .emit('onMessageCreatedSidebar', {
        message: data.message
      })
  }

  @SubscribeMessage('updateMessage')
  async updateMessage(
    @MessageBody()
    data: {
      message: Message
    }
  ) {
    console.log(
      `${data.message.user.username} update message ${data.message.id} in conversation ${data.message.conversation.id}`
    )

    this.server
      .to(`conversation-${data.message.conversation.id}`)
      .emit('onMessageUpdated', { message: data.message })
  }

  @SubscribeMessage('deleteMessage')
  async onMessageDeleted(
    @MessageBody()
    data: {
      messageId: string
      conversationId: string
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

    this.server.to(`user-${data.userId}`).emit('onTypingStartConversation', {
      conversationId: data.conversationId
    })
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

    this.server.to(`user-${data.userId}`).emit('onTypingStopConversation', {
      conversationId: data.conversationId
    })
  }

  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} accept friend request ${data.userId}`
    )

    this.server.to(`user-${data.userId}`).emit('onFriendRequestAccepted', {
      userId: socket.data.user.id
    })

    this.server
      .to(`user-${socket.data.user.id}`)
      .emit('onFriendRequestAccepted', {
        userId: data.userId
      })
  }

  @SubscribeMessage('declineFriendRequest')
  async declineFriendRequest(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} decline friend request ${data.userId}`
    )

    this.server.to(`user-${data.userId}`).emit('onFriendRequestDeclined', {
      userId: socket.data.user.id
    })

    this.server
      .to(`user-${socket.data.user.id}`)
      .emit('onFriendRequestDeclined', {
        userId: data.userId
      })
  }

  @SubscribeMessage('cancelFriendRequest')
  async cancelFriendRequest(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} cancel friend request ${data.userId}`
    )

    this.server.to(`user-${data.userId}`).emit('onFriendRequestCanceled', {
      userId: socket.data.user.id
    })

    this.server
      .to(`user-${socket.data.user.id}`)
      .emit('onFriendRequestCanceled', {
        userId: data.userId
      })
  }

  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    @MessageBody() data: { user: User },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(
      `${socket.data.user.username} send friend request ${data.user.username}`
    )

    this.server.to(`user-${data.user.id}`).emit('onFriendRequestSentReceived', {
      user: socket.data.user
    })

    this.server
      .to(`user-${socket.data.user.id}`)
      .emit('onFriendRequestSentSended', {
        user: data.user
      })
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    console.log(`${socket.data.user.username} remove friend ${data.userId}`)

    this.server.to(`user-${data.userId}`).emit('onFriendRemoved', {
      userId: socket.data.user.id
    })

    this.server.to(`user-${socket.data.user.id}`).emit('onFriendRemoved', {
      userId: data.userId
    })
  }

  @SubscribeMessage('createConversation')
  async createConversation(
    @MessageBody() data: { conversation: Conversation }
  ) {
    console.log(
      `${data.conversation.creator.username} create conversation with ${data.conversation.recipient.username}`
    )

    this.server
      .to(`user-${data.conversation.creator.id}`)
      .to(`user-${data.conversation.recipient.id}`)
      .emit('onConversationCreated', { conversation: data.conversation })
  }

  @SubscribeMessage('getFriendsStatus')
  async getFriendsStatus(
    @MessageBody() data: { userIds: string[] },
    @ConnectedSocket() socket: Socket
  ) {
    try {
      console.log(`${socket.data.user.username} get friends status`)

      const friendsStatusIds = data.userIds
        .map((id) => {
          return this.server.sockets.adapter.rooms.get(`user-${id}`) ? id : null
        })
        .filter((id) => id !== null)

      socket.emit('onFriendsStatus', { friendsStatusIds })

      return true
    } catch (error) {
      return false
    }
  }

  @SubscribeMessage('onConnected')
  async onConnected(
    @MessageBody() data: { userIds: string[] },
    @ConnectedSocket() socket: Socket
  ) {
    try {
      console.log(`${socket.data.user.username} connected`)

      this.server
        .to(data.userIds.map((id) => `user-${id}`))
        .emit('onFriendsStatusConnected', {
          userId: socket.data.user.id
        })

      return true
    } catch (error) {
      return false
    }
  }
}
