import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent
} from 'typeorm'

import { Message } from '../entities/message.entity'
import { Conversation } from '@/conversation/entities/conversation.entity'

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  listenTo() {
    return Message
  }

  async afterInsert(event: InsertEvent<Message>) {
    await event.manager
      .createQueryBuilder()
      .update(Conversation)
      .set({
        lastMessageSentAt: event.entity.createdAt
      })
      .where('id = :id', { id: event.entity.conversationId })
      .execute()
  }
}
