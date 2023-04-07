import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  ConversationResolver,
  UserConversationResolver
} from './conversation.resolver'
import { ConversationService } from './conversation.service'
import { Conversation } from './entities/conversation.entity'
import { ImageModule } from '@/image/image.module'
import { MessageModule } from '@/message/message.module'
import { UserModule } from '@/user/user.module'
import { Services } from '@/utils/constants'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    forwardRef(() => UserModule),
    MessageModule,
    ImageModule
  ],
  providers: [
    {
      provide: Services.CONVERSATION,
      useClass: ConversationService
    },
    ConversationResolver,
    UserConversationResolver
  ],
  exports: [Services.CONVERSATION]
})
export class ConversationModule {}
