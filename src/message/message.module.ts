import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MessageService } from './message.service'
import { MessageResolver } from './message.resolver'
import { Message } from './entities/message.entity'
import { Services } from '@/utils/constants'
import { UserModule } from '@/user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule],
  providers: [
    {
      provide: Services.MESSAGE,
      useClass: MessageService
    },
    MessageResolver
  ]
})
export class MessageModule {}
