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

import { CreateMessageInput } from './dto/create-message.input'
import { DeleteMessageArgs } from './dto/delete-message.input'
import { FindOneMessageArgs } from './dto/findone-message.input'
import {
  PaginationMessage,
  PaginationMessageArgs
} from './dto/pagination-message.dto'
import { UpdateMessageInput } from './dto/update-message.input'
import { Message } from './entities/message.entity'
import { MessageService } from './message.service'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { ConversationService } from '@/conversation/conversation.service'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@Resolver(Message)
@UseGuards(JwtAuthGuard)
export class MessageResolver {
  constructor(
    @Inject(Services.MESSAGE) private readonly messageService: MessageService,
    @Inject(Services.USER) private readonly userService: UserService,
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService
  ) {}

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

  @Mutation(() => Message, {
    name: 'UpdateMessage',
    description: 'Update a message by id.'
  })
  async update(
    @Args('input') input: UpdateMessageInput,
    @CurrentUser() user: UserPayload
  ): Promise<Message> {
    return await this.messageService.update(input, user.id)
  }

  @Mutation(() => ID, {
    name: 'DeleteMessage',
    description: 'Delete a message by id.'
  })
  async deleteMessage(
    @Args() args: DeleteMessageArgs,
    @CurrentUser() user: UserPayload
  ): Promise<Message['id'] | null> {
    return await this.messageService.delete(args.id, user.id)
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
