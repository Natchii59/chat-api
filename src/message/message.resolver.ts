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

@Resolver(Message)
export class MessageResolver {
  constructor(
    @Inject(Services.MESSAGE) private readonly messageService: MessageService,
    @Inject(Services.USER) private readonly userService: UserService
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
      id: args.id,
      user: { id: user.id }
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
    return await this.userService.findOne({ id: message.userId })
  }
}
