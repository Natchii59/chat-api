import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { User } from './entities/user.entity'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'
import { ConversationModule } from '@/conversation/conversation.module'
import { ImageModule } from '@/image/image.module'
import { ImageStorageModule } from '@/image-storage/image-storage.module'
import { Services } from '@/utils/constants'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConversationModule,
    ImageStorageModule,
    ImageModule
  ],
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
