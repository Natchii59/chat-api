import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'
import { v4 } from 'uuid'

import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'
import { User } from './entities/user.entity'
import { formatImage, hashData } from '@/utils/functions'
import { Services } from '@/utils/constants'
import { ImageStorageService } from '@/image-storage/image-storage.service'
import { ImageService } from '@/image/image.service'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: ImageStorageService,
    @Inject(Services.IMAGE) private readonly imageService: ImageService
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
    const user = await this.findOne({
      where: { id },
      relations: input.avatar ? ['avatar'] : undefined
    })

    if (!user) return null

    if (input.password) input.password = await hashData(input.password)

    if (input.avatar) {
      const buffer = await formatImage(input.avatar, 200)

      const key = v4()

      if (user.avatar) {
        await this.imageStorageService.delete(`${id}/${user.avatar.key}`)

        await this.imageService.delete(user.avatar.id)
      }

      await this.imageStorageService.upload({
        mimetype: 'image/webp',
        key: `${id}/${key}`,
        buffer
      })

      const avatar = await this.imageService.create({
        buffer,
        key
      })

      user.avatar = avatar
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { avatar, ...restInput } = input

    await this.userRepository.save({
      ...user,
      ...restInput
    })

    return user
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
