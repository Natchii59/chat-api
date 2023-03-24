import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Inject, UseGuards } from '@nestjs/common'

import { ConversationService } from './conversation.service'
import { Conversation } from './entities/conversation.entity'
import {
  CreateConversationInput,
  CreateConversationOutput
} from './dto/create-conversation.input'
import { FindOneConversationArgs } from './dto/findone-conversation.input'
import { DeleteConversationArgs } from './dto/delete-conversation.input'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { Services } from '@/utils/constants'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import { Message } from '@/message/entities/message.entity'
import { MessageService } from '@/message/message.service'
import { CloseConversationArgs } from './dto/close-conversation.input'

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
    @Inject(Services.USER)
    private readonly userService: UserService,
    @Inject(Services.MESSAGE)
    private readonly messageService: MessageService
  ) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Query(() => Conversation, {
    name: 'FindOneConversation',
    description: 'Find one conversation by id.',
    nullable: true
  })
  findOne(
    @Args() args: FindOneConversationArgs,
    @CurrentUser() user: UserPayload
  ) {
    return this.conversationService.findOne({
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
    description: 'Delete a conversation by id.',
    nullable: true
  })
  delete(@Args() args: DeleteConversationArgs) {
    return this.conversationService.delete(args.id)
  }

  @ResolveField(() => User, {
    name: 'user1',
    description: 'Get the first user of the conversation.'
  })
  async user1(@Parent() conversation: Conversation) {
    return this.userService.findOne({
      where: {
        id: conversation.user1Id
      }
    })
  }

  @ResolveField(() => User, {
    name: 'user2',
    description: 'Get the second user of the conversation.'
  })
  async user2(@Parent() conversation: Conversation) {
    return this.userService.findOne({
      where: {
        id: conversation.user2Id
      }
    })
  }

  @ResolveField(() => Message, {
    name: 'lastMessage',
    description: 'Get the last message of the conversation.',
    nullable: true
  })
  async lastMessage(@Parent() conversation: Conversation) {
    return this.messageService.findOne({
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

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Conversation, {
    name: 'CloseConversation',
    description: 'Close a conversation for user.',
    nullable: true
  })
  async closeConversation(
    @Args() args: CloseConversationArgs,
    @CurrentUser() user: UserPayload
  ) {
    return this.conversationService.closeConversation(args.id, user.id)
  }
}
