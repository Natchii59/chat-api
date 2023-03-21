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
import {
  FriendRequesUsertArgs,
  SendFriendRequestArgs
} from './dto/friend-request-user.input'

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
    return await this.userService.findOne({
      where: { ...input }
    })
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
    return await this.conversationService.getUserConversations(user.id)
  }

  @ResolveField(() => [User], {
    name: 'friends',
    description: 'Get all friends of a user',
    nullable: true
  })
  async friends(@Parent() user: User): Promise<User[]> {
    return await this.userService.findAllFriends(user.id)
  }

  @ResolveField(() => [User], {
    name: 'receivedRequests',
    description: 'Get all received requests of a user',
    nullable: true
  })
  async receivedRequests(@Parent() user: User): Promise<User[]> {
    return await this.userService.findAllReceivedRequests(user.id)
  }

  @ResolveField(() => [User], {
    name: 'sentRequests',
    description: 'Get all sent requests of a user',
    nullable: true
  })
  async sentRequests(@Parent() user: User): Promise<User[]> {
    return await this.userService.findAllSentRequests(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'AcceptFriendRequest',
    description: 'Accept a friend request',
    nullable: true
  })
  async acceptFriendRequest(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User | null> {
    return await this.userService.acceptFriendRequest(user.id, args.id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'DeclineFriendRequest',
    description: 'Decline a friend request',
    nullable: true
  })
  async declineFriendRequest(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User | null> {
    return await this.userService.declineFriendRequest(user.id, args.id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'CancelFriendRequest',
    description: 'Cancel a friend request',
    nullable: true
  })
  async cancelFriendRequest(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User | null> {
    return await this.userService.cancelFriendRequest(user.id, args.id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'SendFriendRequest',
    description: 'Send a friend request',
    nullable: true
  })
  async sendFriendRequest(
    @Args() args: SendFriendRequestArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User | null> {
    return await this.userService.sendFriendRequest(user.id, args.username)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User, {
    name: 'RemoveFriend',
    description: 'Remove a friend',
    nullable: true
  })
  async removeFriend(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User | null> {
    return await this.userService.removeFriend(user.id, args.id)
  }
}
