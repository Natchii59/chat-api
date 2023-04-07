import { Inject, UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Not } from 'typeorm'

import { ConversationService } from './conversation.service'
import { CloseConversationArgs } from './dto/close-conversation.input'
import {
  CreateConversationInput,
  CreateConversationOutput
} from './dto/create-conversation.input'
import { DeleteConversationArgs } from './dto/delete-conversation.input'
import { FindOneConversationArgs } from './dto/findone-conversation.input'
import { UserConversation } from './dto/user-conversation.output'
import { Conversation } from './entities/conversation.entity'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { Image } from '@/image/entities/image.entity'
import { ImageService } from '@/image/image.service'
import { MessageService } from '@/message/message.service'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@Resolver(() => Conversation)
@UseGuards(JwtAuthGuard)
export class ConversationResolver {
  constructor(
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
    @Inject(Services.USER)
    private readonly userService: UserService,
    @Inject(Services.MESSAGE)
    private readonly messageService: MessageService
  ) {}

  @Query(() => Conversation, {
    name: 'FindOneConversation',
    description: 'Find one conversation by id.',
    nullable: true
  })
  async findOne(
    @Args() args: FindOneConversationArgs,
    @CurrentUser() user: UserPayload
  ): Promise<Conversation | null> {
    return await this.conversationService.findOne({
      where: [
        {
          id: args.id,
          creator: {
            id: user.id
          }
        },
        {
          id: args.id,
          recipient: {
            id: user.id
          }
        }
      ]
    })
  }

  @Query(() => [Conversation], {
    name: 'UserConversations',
    description: 'Find all conversations for user.'
  })
  async getUserConversations(
    @CurrentUser() user: UserPayload
  ): Promise<Conversation[] | null> {
    return await this.conversationService.getUserConversations(user.id)
  }

  @Mutation(() => CreateConversationOutput, {
    name: 'CreateConversation',
    description: 'Create a new conversation.'
  })
  async create(
    @Args('input') input: CreateConversationInput,
    @CurrentUser() user: UserPayload
  ): Promise<CreateConversationOutput> {
    return this.conversationService.create(input, user.id)
  }

  @Mutation(() => ID, {
    name: 'DeleteConversation',
    description: 'Delete a conversation by id.'
  })
  async delete(
    @Args() args: DeleteConversationArgs
  ): Promise<Conversation['id']> {
    return await this.conversationService.delete(args.id)
  }

  @Mutation(() => Conversation, {
    name: 'CloseConversation',
    description: 'Close a conversation for user.'
  })
  async closeConversation(
    @Args() args: CloseConversationArgs,
    @CurrentUser() user: UserPayload
  ): Promise<Conversation> {
    return this.conversationService.closeConversation(args.id, user.id)
  }

  @ResolveField(() => UserConversation, {
    name: 'creator',
    description: 'Get the creator of the conversation.'
  })
  async creator(
    @Parent() conversation: Conversation
  ): Promise<UserConversation> {
    const user = await this.userService.findOne({
      where: {
        id: conversation.creatorId
      }
    })

    const firstUnreadMessage = await this.messageService.findOne({
      where: {
        conversation: {
          id: conversation.id
        },
        user: {
          id: Not(user.id)
        },
        unreadBy: { id: user.id }
      },
      order: {
        createdAt: 'ASC'
      }
    })

    const unreadMessagesCount = await this.messageService.count({
      where: {
        conversation: {
          id: conversation.id
        },
        user: {
          id: Not(user.id)
        },
        unreadBy: { id: user.id }
      }
    })

    return {
      ...user,
      firstUnreadMessageId: firstUnreadMessage?.id,
      unreadMessagesCount
    }
  }

  @ResolveField(() => UserConversation, {
    name: 'recipient',
    description: 'Get the recipient of the conversation.'
  })
  async recipient(
    @Parent() conversation: Conversation
  ): Promise<UserConversation> {
    const user = await this.userService.findOne({
      where: {
        id: conversation.recipientId
      }
    })

    const firstUnreadMessage = await this.messageService.findOne({
      where: {
        conversation: {
          id: conversation.id
        },
        user: {
          id: Not(user.id)
        },
        unreadBy: { id: user.id }
      },
      order: {
        createdAt: 'ASC'
      }
    })

    const unreadMessagesCount = await this.messageService.count({
      where: {
        conversation: {
          id: conversation.id
        },
        user: {
          id: Not(user.id)
        },
        unreadBy: { id: user.id }
      }
    })

    return {
      ...user,
      firstUnreadMessageId: firstUnreadMessage?.id,
      unreadMessagesCount
    }
  }
}

@Resolver(UserConversation)
export class UserConversationResolver {
  constructor(
    @Inject(Services.IMAGE)
    private readonly imageService: ImageService
  ) {}

  @ResolveField(() => Image, {
    name: 'avatar',
    description: 'Avatar of a user.',
    nullable: true
  })
  async avatar(@Parent() user: UserConversation): Promise<Image | null> {
    if (!user.avatarId) return null

    return await this.imageService.findOne({
      where: { id: user.avatarId }
    })
  }
}
