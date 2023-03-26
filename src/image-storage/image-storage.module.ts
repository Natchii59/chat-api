import { S3 } from '@aws-sdk/client-s3'
import { Module } from '@nestjs/common'
import { config } from 'dotenv'

import { ImageStorageService } from './image-storage.service'
import { Services } from '../utils/constants'

config()

@Module({
  providers: [
    {
      provide: Services.SPACES_CLIENT,
      useValue: new S3({
        endpoint: 'https://ams3.digitaloceanspaces.com',
        region: 'ams3',
        credentials: {
          accessKeyId: process.env.SPACES_KEY,
          secretAccessKey: process.env.SPACES_SECRET_KEY
        }
      })
    },
    {
      provide: Services.IMAGE_STORAGE,
      useClass: ImageStorageService
    }
  ],
  exports: [Services.SPACES_CLIENT, Services.IMAGE_STORAGE]
})
export class ImageStorageModule {}
