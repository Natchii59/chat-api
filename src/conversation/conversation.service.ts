import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm'
import { orderBy, get } from 'lodash'

import { CreateConversationInput } from './dto/create-conversation.input'
import { Conversation } from './entities/conversation.entity'
import { User } from '@/user/entities/user.entity'

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  async create(
    input: CreateConversationInput,
    userId: User['id']
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      user1: { id: userId },
      user2: { id: input.userId }
    })

    return await this.conversationRepository.save(conversation)
  }

  async findOne(
    input: FindOneOptions<Conversation>
  ): Promise<Conversation | null> {
    return await this.conversationRepository.findOne(input)
  }

  async find(
    input: FindManyOptions<Conversation>
  ): Promise<Conversation[] | null> {
    return await this.conversationRepository.find(input)
  }

  async delete(id: Conversation['id']): Promise<Conversation['id'] | null> {
    const result = await this.conversationRepository.delete(id)

    if (result.affected) return id

    return null
  }

  async getUserConversations(
    userId: User['id']
  ): Promise<Conversation[] | null> {
    const result = await this.conversationRepository.find({
      where: [
        {
          user1: {
            id: userId
          }
        },
        {
          user2: {
            id: userId
          }
        }
      ],
      order: {
        messages: {
          createdAt: 'DESC'
        }
      },
      relations: ['messages']
    })

    return orderBy(
      result,
      (conversation) => {
        const lastMessage = get(conversation, 'messages[0]', null)

        if (lastMessage) {
          return lastMessage.createdAt
        }

        return conversation.createdAt
      },
      'desc'
    )
  }
}
