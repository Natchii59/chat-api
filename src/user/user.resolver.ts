import { Inject, UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent
} from '@nestjs/graphql'

import { UserService } from './user.service'
import { User } from './entities/user.entity'
import { UpdateUserInput } from './dto/update-user.input'
import { FindOneUserInput } from './dto/findone-user.input'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { Services } from '@/utils/constants'
import { ConversationService } from '@/conversation/conversation.service'
import { Conversation } from '@/conversation/entities/conversation.entity'

@Resolver(User)
export class UserResolver {
  constructor(
    @Inject(Services.USER) private readonly userService: UserService,
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService
  ) {}

  @Query(() => User, {
    name: 'FindOneUser',
    description: 'Get a user by args',
    nullable: true
  })
  async findOne(@Args('input') input: FindOneUserInput): Promise<User | null> {
    return await this.userService.findOne(input)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'UpdateUser',
    description: 'Update a user',
    nullable: true
  })
  async update(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: UserPayload
  ): Promise<User | null> {
    return await this.userService.update(user.id, input)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'DeleteUser',
    description: 'Delete a user',
    nullable: true
  })
  async delete(@CurrentUser() user: UserPayload): Promise<User['id'] | null> {
    return await this.userService.delete(user.id)
  }

  @ResolveField(() => [Conversation], {
    name: 'conversations',
    description: 'Get all conversations of a user'
  })
  async conversations(@Parent() user: User): Promise<Conversation[]> {
    return await this.conversationService.find({
      where: [
        {
          user1: {
            id: user.id
          }
        },
        {
          user2: {
            id: user.id
          }
        }
      ],
      order: {
        messages: {
          createdAt: 'DESC'
        }
      }
    })
  }
}
