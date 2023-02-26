import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserService } from './user.service'
import { UserResolver } from './user.resolver'
import { User } from './entities/user.entity'
import { Services } from '@/utils/constants'
import { ConversationModule } from '@/conversation/conversation.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConversationModule],
  providers: [
    {
      provide: Services.USER,
      useClass: UserService
    },
    UserResolver
  ],
  exports: [Services.USER]
})
export class UserModule {}
