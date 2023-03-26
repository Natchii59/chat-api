import { Inject, ForbiddenException, UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent
} from '@nestjs/graphql'

import { FindOneUserInput } from './dto/findone-user.input'
import {
  FriendRequesUsertArgs,
  SendFriendRequestArgs
} from './dto/friend-request-user.input'
import { UpdateUserInput } from './dto/update-user.input'
import { User } from './entities/user.entity'
import { UserService } from './user.service'
import { UserPayload } from '@/auth/dto/payload-user.dto'
import { CurrentUser, JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { ConversationService } from '@/conversation/conversation.service'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { Image } from '@/image/entities/image.entity'
import { ImageService } from '@/image/image.service'
import { Services } from '@/utils/constants'
import { Public } from '@/utils/decorators/public.decorator'

@Resolver(User)
@UseGuards(JwtAuthGuard)
export class UserResolver {
  constructor(
    @Inject(Services.USER) private readonly userService: UserService,
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
    @Inject(Services.IMAGE)
    private readonly imageService: ImageService
  ) {}

  @Public()
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

  @Mutation(() => User, {
    name: 'UpdateUser',
    description: 'Update a user'
  })
  async update(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    return await this.userService.update(user.id, input)
  }

  @Mutation(() => User, {
    name: 'DeleteUser',
    description: 'Delete a user'
  })
  async delete(@CurrentUser() user: UserPayload): Promise<User['id']> {
    return await this.userService.delete(user.id)
  }

  @Mutation(() => User, {
    name: 'SendFriendRequest',
    description: 'Send a friend request'
  })
  async sendFriendRequest(
    @Args() args: SendFriendRequestArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    return await this.userService.sendFriendRequest(user.id, args.username)
  }

  @Mutation(() => User, {
    name: 'AcceptFriendRequest',
    description: 'Accept a friend request'
  })
  async acceptFriendRequest(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    return await this.userService.acceptFriendRequest(user.id, args.id)
  }

  @Mutation(() => User, {
    name: 'DeclineFriendRequest',
    description: 'Decline a friend request'
  })
  async declineFriendRequest(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    return await this.userService.declineFriendRequest(user.id, args.id)
  }

  @Mutation(() => User, {
    name: 'CancelFriendRequest',
    description: 'Cancel a friend request'
  })
  async cancelFriendRequest(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    return await this.userService.cancelFriendRequest(user.id, args.id)
  }

  @Mutation(() => User, {
    name: 'RemoveFriend',
    description: 'Remove a friend'
  })
  async removeFriend(
    @Args() args: FriendRequesUsertArgs,
    @CurrentUser() user: UserPayload
  ): Promise<User> {
    return await this.userService.removeFriend(user.id, args.id)
  }

  @ResolveField(() => [User], {
    name: 'friends',
    description: 'Get all friends of a user',
    nullable: true
  })
  async friends(
    @Parent() user: User,
    @CurrentUser() currentUser: User
  ): Promise<User[]> {
    if (user.id !== currentUser.id)
      throw new ForbiddenException('You are not allowed to access friends')

    return await this.userService.findAllFriends(user.id)
  }

  @ResolveField(() => [User], {
    name: 'receivedRequests',
    description: 'Get all received requests of a user',
    nullable: true
  })
  async receivedRequests(
    @Parent() user: User,
    @CurrentUser() currentUser: User
  ): Promise<User[]> {
    if (user.id !== currentUser.id)
      throw new ForbiddenException(
        'You are not allowed to access received requests'
      )

    return await this.userService.findAllReceivedRequests(user.id)
  }

  @ResolveField(() => [User], {
    name: 'sentRequests',
    description: 'Get all sent requests of a user',
    nullable: true
  })
  async sentRequests(
    @Parent() user: User,
    @CurrentUser() currentUser: User
  ): Promise<User[]> {
    if (user.id !== currentUser.id)
      throw new ForbiddenException(
        'You are not allowed to access sent requests'
      )

    return await this.userService.findAllSentRequests(user.id)
  }

  @Public()
  @ResolveField(() => Image, {
    name: 'avatar',
    description: 'Avatar of a user',
    nullable: true
  })
  async avatar(@Parent() user: User): Promise<Image | null> {
    if (!user.avatarId) return null

    return await this.imageService.findOne({
      where: { id: user.avatarId }
    })
  }

  @ResolveField(() => [Conversation], {
    name: 'conversations',
    description: 'Get all conversations of a user',
    nullable: true
  })
  async conversations(
    @Parent() user: User,
    @CurrentUser() currentUser: User
  ): Promise<Conversation[]> {
    if (user.id !== currentUser.id)
      throw new ForbiddenException(
        'You are not allowed to access conversations'
      )

    return await this.conversationService.getUserConversations(user.id)
  }
}
