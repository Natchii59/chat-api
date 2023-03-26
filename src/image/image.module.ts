import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Image } from './entities/image.entity'
import { ImageService } from './image.service'
import { Services } from '@/utils/constants'

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [
    {
      provide: Services.IMAGE,
      useClass: ImageService
    }
  ],
  exports: [Services.IMAGE]
})
export class ImageModule {}
