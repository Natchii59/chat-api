import { Inject, Injectable } from '@nestjs/common'
import { PutObjectCommandOutput, S3 } from '@aws-sdk/client-s3'

import { Services } from '../utils/constants'
import { UploadImageParams } from './dto/upload-file.dto'

@Injectable()
export class ImageStorageService {
  constructor(
    @Inject(Services.SPACES_CLIENT)
    private readonly spacesClient: S3
  ) {}

  async upload(params: UploadImageParams): Promise<PutObjectCommandOutput> {
    return await this.spacesClient.putObject({
      Bucket: 'chatappdev',
      Key: params.key,
      Body: params.buffer,
      ACL: 'public-read',
      ContentType: params.mimetype
    })
  }

  async delete(key: string): Promise<void> {
    await this.spacesClient.deleteObject({
      Bucket: 'chatappdev',
      Key: key
    })
  }
}
