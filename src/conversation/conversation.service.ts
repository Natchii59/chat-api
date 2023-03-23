import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm'
import { orderBy } from 'lodash'

import { CreateConversationInput } from './dto/create-conversation.input'
import { Conversation } from './entities/conversation.entity'
import { User } from '@/user/entities/user.entity'
import { Services } from '@/utils/constants'
import { MessageService } from '@/message/message.service'

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.MESSAGE) private readonly messageService: MessageService
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
    const conversations = await this.conversationRepository.find({
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
      ]
    })

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await this.messageService.findOne({
          where: {
            conversation: {
              id: conversation.id
            }
          },
          order: {
            createdAt: 'DESC'
          }
        })

        const sortedDate = lastMessage
          ? lastMessage.createdAt
          : conversation.createdAt

        return {
          ...conversation,
          sortedDate
        }
      })
    )

    const sortedConversation = orderBy(data, 'sortedDate', 'desc')

    return sortedConversation.map((conversation) => {
      delete conversation.sortedDate
      return conversation
    })
  }
}
