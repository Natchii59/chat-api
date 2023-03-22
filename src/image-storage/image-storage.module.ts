import { config } from 'dotenv'
config()

import { Module } from '@nestjs/common'
import { Services } from '../utils/constants'
import { S3 } from '@aws-sdk/client-s3'
import { ImageStorageService } from './image-storage.service'

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
  exports: [
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
  ]
})
export class ImageStorageModule {}
