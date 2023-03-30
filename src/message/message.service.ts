import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  LessThan,
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

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  async create(
    input: CreateMessageInput,
    userId: User['id']
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: input.conversationId
      },
      relations: ['closedBy', 'user1', 'user2']
    })

    if (!conversation) throw new ConversationNotFoundException()

    if (conversation.user1.id !== userId && conversation.user2.id !== userId)
      throw new NotFoundException('Invalid conversation or user')

    const message = this.messageRepository.create({
      content: input.content,
      user: { id: userId },
      conversation
    })

    const otherUser =
      conversation.user1.id === userId ? conversation.user2 : conversation.user1

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

    message.content = input.content
    message.isModified = true

    return await this.messageRepository.save(message)
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
              user1: { id: userId }
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
              user2: { id: userId }
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
}
