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

import { ConversationService } from './conversation.service'
import { CloseConversationArgs } from './dto/close-conversation.input'
import {
  CreateConversationInput,
  CreateConversationOutput
} from './dto/create-conversation.input'
import { DeleteConversationArgs } from './dto/delete-conversation.input'
import { FindOneConversationArgs } from './dto/findone-conversation.input'
import { Conversation } from './entities/conversation.entity'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { Message } from '@/message/entities/message.entity'
import { MessageService } from '@/message/message.service'
import { User } from '@/user/entities/user.entity'
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
          user1: {
            id: user.id
          }
        },
        {
          id: args.id,
          user2: {
            id: user.id
          }
        }
      ]
    })
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

  @ResolveField(() => User, {
    name: 'user',
    description: 'Get the other user of the conversation.'
  })
  async user(
    @Parent() conversation: Conversation,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    const otherUserId =
      conversation.user1Id === user.id
        ? conversation.user2Id
        : conversation.user1Id

    return await this.userService.findOne({
      where: {
        id: otherUserId
      }
    })
  }

  @ResolveField(() => Message, {
    name: 'lastMessage',
    description: 'Get the last message of the conversation.',
    nullable: true
  })
  async lastMessage(@Parent() conversation: Conversation): Promise<Message> {
    return await this.messageService.findOne({
      where: {
        conversation: {
          id: conversation.id
        }
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }
}
