import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'
import { User } from './entities/user.entity'
import { hashData } from '@/utils/functions'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    if (await this.userRepository.findOneBy({ username: input.username })) {
      throw new BadRequestException([
        {
          code: 'username',
          message: 'The username already exists.'
        }
      ])
    }

    const passwordHash = await hashData(input.password)

    const user = this.userRepository.create({
      ...input,
      password: passwordHash
    })

    return await this.userRepository.save(user)
  }

  async findOne(input: FindOneOptions<User>): Promise<User | null> {
    return await this.userRepository.findOne({ ...input })
  }

  async update(id: User['id'], input: UpdateUserInput): Promise<User | null> {
    if (input.password) input.password = await hashData(input.password)

    const result = await this.userRepository.update(id, input)

    if (result.affected) return await this.userRepository.findOneBy({ id })

    return null
  }

  async delete(id: User['id']): Promise<User['id'] | null> {
    const result = await this.userRepository.delete(id)

    if (result.affected) return id

    return null
  }

  async findAllFriends(id: User['id']): Promise<User[] | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['senderFriends', 'receiverFriends']
    })

    if (!user) return null

    return [...user.senderFriends, ...user.receiverFriends].sort((a, b) =>
      a.username.localeCompare(b.username)
    )
  }

  async findAllReceivedRequests(id: User['id']): Promise<User[] | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['receivedRequests']
    })

    if (!user) return null

    return user.receivedRequests
  }

  async findAllSentRequests(id: User['id']): Promise<User[] | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['sentRequests']
    })

    if (!user) return null

    return user.sentRequests
  }

  async acceptFriendRequest(
    id: User['id'],
    friendId: User['id']
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['receiverFriends']
    })

    const friend = await this.userRepository.findOne({
      where: { id: friendId },
      relations: ['sentRequests']
    })

    if (!user || !friend) return null

    user.receiverFriends.push(friend)
    friend.sentRequests = friend.sentRequests.filter((user) => user.id !== id)

    await this.userRepository.save(user)
    await this.userRepository.save(friend)

    return friend
  }

  async declineFriendRequest(
    id: User['id'],
    friendId: User['id']
  ): Promise<User | null> {
    const friend = await this.userRepository.findOne({
      where: { id: friendId },
      relations: ['sentRequests']
    })

    if (!friend) return null

    friend.sentRequests = friend.sentRequests.filter((user) => user.id !== id)

    await this.userRepository.save(friend)

    return friend
  }

  async cancelFriendRequest(
    id: User['id'],
    friendId: User['id']
  ): Promise<User | null> {
    const friend = await this.userRepository.findOne({
      where: { id: friendId },
      relations: ['receivedRequests']
    })

    if (!friend) return null

    friend.receivedRequests = friend.receivedRequests.filter(
      (user) => user.id !== id
    )

    await this.userRepository.save(friend)

    return friend
  }

  async sendFriendRequest(
    id: User['id'],
    friendUsername: User['username']
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['receivedRequests', 'senderFriends', 'receiverFriends']
    })

    const friend = await this.userRepository.findOne({
      where: { username: friendUsername },
      relations: ['receivedRequests']
    })

    if (!user || !friend) return null

    if (user.id === friend.id)
      throw new BadRequestException(
        'You cannot send a friend request to yourself'
      )

    if (user.receivedRequests.find((user) => user.id === friend.id))
      throw new BadRequestException(
        'You already received a friend request from this user'
      )

    if (
      [...user.senderFriends, ...user.receiverFriends].find(
        (user) => user.id === friend.id
      )
    )
      throw new BadRequestException('You are already friends with this user')

    friend.receivedRequests.push(user)

    await this.userRepository.save(friend)

    return friend
  }

  async removeFriend(
    id: User['id'],
    friendId: User['id']
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['senderFriends', 'receiverFriends']
    })

    const friend = await this.userRepository.findOne({
      where: { id: friendId },
      relations: ['senderFriends', 'receiverFriends']
    })

    if (!user || !friend) return null

    friend.senderFriends = friend.senderFriends.filter(
      (user) => user.id !== user.id
    )
    friend.receiverFriends = friend.receiverFriends.filter(
      (user) => user.id !== user.id
    )

    await this.userRepository.save(friend)

    return friend
  }
}
