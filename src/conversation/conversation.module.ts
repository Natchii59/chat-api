import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ConversationService } from './conversation.service'
import { ConversationResolver } from './conversation.resolver'
import { Conversation } from './entities/conversation.entity'
import { Services } from '@/utils/constants'
import { UserModule } from '@/user/user.module'
import { MessageModule } from '@/message/message.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    forwardRef(() => UserModule),
    MessageModule
  ],
  providers: [
    {
      provide: Services.CONVERSATION,
      useClass: ConversationService
    },
    ConversationResolver
  ],
  exports: [Services.CONVERSATION]
})
export class ConversationModule {}
