import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GatewayGateway } from './gateway'
import { GatewaySessionManager } from './gateway.session'
import { AuthModule } from '@/auth/auth.module'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { MessageModule } from '@/message/message.module'
import { UserModule } from '@/user/user.module'
import { Services } from '@/utils/constants'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    AuthModule,
    UserModule,
    MessageModule
  ],
  providers: [
    GatewayGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager
    }
  ]
})
export class GatewayModule {}
