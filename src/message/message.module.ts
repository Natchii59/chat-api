import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Message } from './entities/message.entity'
import { MessageResolver } from './message.resolver'
import { MessageService } from './message.service'
import { ConversationModule } from '@/conversation/conversation.module'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { UserModule } from '@/user/user.module'
import { Services } from '@/utils/constants'

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    forwardRef(() => UserModule),
    forwardRef(() => ConversationModule)
  ],
  providers: [
    {
      provide: Services.MESSAGE,
      useClass: MessageService
    },
    MessageResolver
  ],
  exports: [Services.MESSAGE]
})
export class MessageModule {}
