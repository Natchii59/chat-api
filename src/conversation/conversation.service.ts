import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import {
  CreateConversationInput,
  CreateConversationOutput
} from './dto/create-conversation.input'
import { Conversation } from './entities/conversation.entity'
import { ConversationNotFoundException } from './exceptions/conversation-not-found.exception'
import { MessageService } from '@/message/message.service'
import { User } from '@/user/entities/user.entity'
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception'
import { UserService } from '@/user/user.service'
import { Services } from '@/utils/constants'

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.MESSAGE) private readonly messageService: MessageService,
    @Inject(Services.USER) private readonly userService: UserService
  ) {}

  async create(
    input: CreateConversationInput,
    userId: User['id']
  ): Promise<CreateConversationOutput> {
    const findConversation = await this.conversationRepository.findOne({
      where: [
        {
          creator: {
            id: userId
          },
          recipient: {
            id: input.userId
          }
        },
        {
          creator: {
            id: input.userId
          },
          recipient: {
            id: userId
          }
        }
      ],
      relations: ['closedBy']
    })

    if (findConversation) {
      const isClosed = findConversation.closedBy.some(
        (user) => user.id === userId
      )

      if (isClosed) {
        findConversation.closedBy = findConversation.closedBy.filter(
          (user) => user.id !== userId
        )

        const closedConversation = await this.conversationRepository.save(
          findConversation
        )

        delete closedConversation.closedBy

        return {
          conversation: closedConversation,
          created: false
        }
      }

      delete findConversation.closedBy

      return {
        conversation: findConversation,
        created: false
      }
    }

    const conversation = this.conversationRepository.create({
      creator: { id: userId },
      recipient: { id: input.userId }
    })

    return {
      conversation: await this.conversationRepository.save(conversation)
    }
  }

  async findOne(
    input: FindOneOptions<Conversation>
  ): Promise<Conversation | null> {
    return await this.conversationRepository.findOne({ ...input })
  }

  async delete(id: Conversation['id']): Promise<Conversation['id']> {
    const result = await this.conversationRepository.delete(id)

    if (!result.affected) throw new ConversationNotFoundException()

    return id
  }

  async getUserConversations(
    userId: User['id']
  ): Promise<Conversation[] | null> {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('creator_id = :userId', { userId })
      .orWhere('recipient_id = :userId', { userId })
      .orderBy(
        'COALESCE(conversation.lastMessageSentAt, conversation.createdAt)',
        'DESC'
      )
      .getMany()
  }

  async closeConversation(
    conversationId: Conversation['id'],
    userId: User['id']
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: conversationId
      },
      relations: ['closedBy']
    })

    if (!conversation) throw new ConversationNotFoundException()

    const user = await this.userService.findOne({
      where: {
        id: userId
      }
    })

    if (!user) throw new UserNotFoundException()

    const isClosed = conversation.closedBy.some((user) => user.id === userId)

    if (isClosed) return conversation

    conversation.closedBy = [...conversation.closedBy, user]

    return await this.conversationRepository.save(conversation)
  }
}
