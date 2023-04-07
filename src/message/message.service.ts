import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  LessThan,
  Not,
  Repository
} from 'typeorm'

import { CreateMessageInput } from './dto/create-message.input'
import {
  PaginationMessage,
  PaginationMessageArgs
} from './dto/pagination-message.dto'
import { UpdateMessageInput } from './dto/update-message.input'
import { Message } from './entities/message.entity'
import { MessageNotFoundException } from './exceptions/message-not-found.exception'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { ConversationNotFoundException } from '@/conversation/exceptions/conversation-not-found.exception'
import { SortDirection } from '@/database/dto/pagination.dto'
import { User } from '@/user/entities/user.entity'
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.USER) private readonly userService: UserService
  ) {}

  async create(
    input: CreateMessageInput,
    userId: User['id']
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: [
        {
          id: input.conversationId,
          creator: { id: userId }
        },
        {
          id: input.conversationId,
          recipient: { id: userId }
        }
      ],
      relations: ['closedBy', 'creator', 'recipient']
    })

    if (!conversation) throw new ConversationNotFoundException()

    const otherUser =
      conversation.creator.id === userId
        ? conversation.recipient
        : conversation.creator

    const message = this.messageRepository.create({
      content: input.content,
      user: { id: userId },
      conversation: { id: conversation.id },
      unreadBy: [{ id: otherUser.id }]
    })

    if (conversation.closedBy.some((user) => user.id === otherUser.id)) {
      conversation.closedBy = conversation.closedBy.filter(
        (user) => user.id !== otherUser.id
      )

      await this.conversationRepository.save(conversation)
    }

    return await this.messageRepository.save(message)
  }

  async findOne(input: FindOneOptions<Message>): Promise<Message | null> {
    return await this.messageRepository.findOne({ ...input })
  }

  async find(input: FindManyOptions<Message>): Promise<Message[]> {
    return await this.messageRepository.find({ ...input })
  }

  async count(input: FindManyOptions<Message>): Promise<number> {
    return await this.messageRepository.count({ ...input })
  }

  async update(
    input: UpdateMessageInput,
    userId: User['id']
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: {
        id: input.id,
        user: { id: userId }
      }
    })

    if (!message) throw new MessageNotFoundException()

    if (input.content && !message.isModified) {
      message.isModified = true
    }

    return await this.messageRepository.save({
      ...message,
      ...input
    })
  }

  async delete(id: Message['id'], userId: User['id']): Promise<Message['id']> {
    const message = await this.messageRepository.findOne({
      where: {
        id,
        user: { id: userId }
      }
    })

    if (!message) throw new MessageNotFoundException()

    await this.messageRepository.delete(id)

    return id
  }

  async pagination(
    args: PaginationMessageArgs,
    userId: User['id']
  ): Promise<PaginationMessage> {
    const options: FindManyOptions<Message> = {
      skip: args.skip,
      take: args.take
    }

    if (args.where) {
      const whereArray: FindOptionsWhere<Message>[] = args.where.map(
        (where) => {
          const whereObject: FindOptionsWhere<Message> = {}

          if (where.id) {
            whereObject.id = where.id
            whereObject.user = { id: userId }
          }

          if (where.conversationId) {
            whereObject.conversation = {
              id: where.conversationId,
              creator: { id: userId }
            }
          }

          if (where.createdAt) {
            whereObject.createdAt = LessThan(where.createdAt)
          }

          return whereObject
        }
      )

      whereArray.forEach((where) => {
        if (where.conversation) {
          whereArray.push({
            ...where,
            conversation: {
              id: where.conversation['id'],
              recipient: { id: userId }
            }
          })
        }
      })

      options.where = whereArray
    }

    if (args.sortBy) {
      options.order = {}

      Object.entries(args.sortBy).forEach(([key, value]) => {
        options.order[key] = value === SortDirection.ASC ? 'ASC' : 'DESC'
      })
    }

    const [nodes, totalCount] = await this.messageRepository.findAndCount(
      options
    )

    return {
      nodes,
      totalCount
    }
  }

  async readMessagesConversation(
    conversationId: Conversation['id'],
    userId: User['id']
  ): Promise<Message['id'][]> {
    const user = await this.userService.findOne({
      where: { id: userId }
    })

    if (!user) throw new UserNotFoundException()

    const messages = await this.messageRepository.find({
      where: {
        conversation: { id: conversationId },
        user: { id: Not(userId) },
        unreadBy: { id: userId }
      },
      relations: ['unreadBy']
    })

    messages.forEach((message) => {
      message.unreadBy = message.unreadBy.filter((user) => user.id !== userId)
    })

    await this.messageRepository.save(messages)

    return messages.map((message) => message.id)
  }
}
