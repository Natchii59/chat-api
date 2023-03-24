import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  LessThan,
  Repository
} from 'typeorm'

import { CreateMessageInput } from './dto/create-message.input'
import { Message } from './entities/message.entity'
import { User } from '@/user/entities/user.entity'
import { SortDirection } from '@/database/dto/pagination.dto'
import {
  PaginationMessage,
  PaginationMessageArgs
} from './dto/pagination-message.dto'
import { Conversation } from '@/conversation/entities/conversation.entity'

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
    const message = this.messageRepository.create({
      content: input.content,
      user: { id: userId },
      conversation: { id: input.conversationId }
    })

    const conversation = await this.conversationRepository.findOne({
      where: {
        id: input.conversationId
      },
      relations: ['closedBy', 'user1', 'user2']
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
    return await this.messageRepository.findOne(input)
  }

  async delete(id: Message['id']): Promise<Message['id'] | null> {
    const result = await this.messageRepository.delete(id)

    if (result.affected) return id

    return null
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
