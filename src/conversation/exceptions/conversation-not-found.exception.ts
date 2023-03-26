import { NotFoundException } from '@nestjs/common'

export class ConversationNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message ?? 'Conversation not found.')
  }
}
