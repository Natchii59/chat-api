import { NotFoundException } from '@nestjs/common'

export class MessageNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message ?? 'Message not found.')
  }
}
