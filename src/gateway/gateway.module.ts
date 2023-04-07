import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Gateway } from './gateway'
import { AuthModule } from '@/auth/auth.module'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { MessageModule } from '@/message/message.module'
import { UserModule } from '@/user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    AuthModule,
    UserModule,
    MessageModule
  ],
  providers: [Gateway]
})
export class GatewayModule {}
