import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { CreateMessageInput } from './dto/create-message.input'
import { Message } from './entities/message.entity'
import { User } from '@/user/entities/user.entity'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) {}

  async create(
    input: CreateMessageInput,
    userId: User['id']
  ): Promise<Message> {
    const message = this.messageRepository.create({
      content: input.content,
      user: { id: userId }
    })

    return await this.messageRepository.save(message)
  }

  async findOne(input: FindOptionsWhere<Message>): Promise<Message | null> {
    return await this.messageRepository.findOneBy(input)
  }

  async delete(id: Message['id']): Promise<Message['id'] | null> {
    const result = await this.messageRepository.delete(id)

    if (result.affected) return id

    return null
  }
}
