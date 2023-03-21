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
import { EventEmitter2 } from '@nestjs/event-emitter'

import { MessageService } from './message.service'
import { Message } from './entities/message.entity'
import { CreateMessageInput } from './dto/create-message.input'
import { FindOneMessageArgs } from './dto/findone-message.input'
import { DeleteMessageArgs } from './dto/delete-message.input'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { Services } from '@/utils/constants'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { ConversationService } from '@/conversation/conversation.service'
import {
  PaginationMessage,
  PaginationMessageArgs
} from './dto/pagination-message.dto'

@Resolver(Message)
export class MessageResolver {
  constructor(
    @Inject(Services.MESSAGE) private readonly messageService: MessageService,
    @Inject(Services.USER) private readonly userService: UserService,
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Message, {
    name: 'CreateMessage',
    description: 'Create a new message.'
  })
  async create(
    @Args('input') input: CreateMessageInput,
    @CurrentUser() user: UserPayload
  ): Promise<Message> {
    return await this.messageService.create(input, user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Message, {
    name: 'FindOneMessage',
    description: 'Find one message by id.',
    nullable: true
  })
  async findOne(
    @Args() args: FindOneMessageArgs,
    @CurrentUser() user: UserPayload
  ): Promise<Message | null> {
    return await this.messageService.findOne({
      where: {
        id: args.id,
        user: { id: user.id }
      }
    })
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ID, {
    name: 'DeleteMessage',
    description: 'Delete a message by id.',
    nullable: true
  })
  async removeMessage(
    @Args() args: DeleteMessageArgs
  ): Promise<Message['id'] | null> {
    return await this.messageService.delete(args.id)
  }

  @ResolveField(() => User, {
    name: 'user',
    description: 'The user who created the message.',
    nullable: true
  })
  async user(@Parent() message: Message): Promise<User> {
    return await this.userService.findOne({ where: { id: message.userId } })
  }

  @ResolveField(() => Conversation, {
    name: 'conversation',
    description: 'The conversation the message belongs to.',
    nullable: true
  })
  async conversation(@Parent() message: Message): Promise<Conversation> {
    return await this.conversationService.findOne({
      where: {
        id: message.conversationId
      }
    })
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => PaginationMessage, {
    name: 'PaginationMessage',
    description: 'Pagination of messages.'
  })
  async pagination(
    @Args() args: PaginationMessageArgs,
    @CurrentUser() user: UserPayload
  ): Promise<PaginationMessage> {
    return await this.messageService.pagination(args, user.id)
  }
}
