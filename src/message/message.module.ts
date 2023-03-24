import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MessageService } from './message.service'
import { MessageResolver } from './message.resolver'
import { Message } from './entities/message.entity'
import { Services } from '@/utils/constants'
import { UserModule } from '@/user/user.module'
import { ConversationModule } from '@/conversation/conversation.module'
import { Conversation } from '@/conversation/entities/conversation.entity'

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
