import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { encode } from 'blurhash'
import * as sharp from 'sharp'
import { FindOneOptions, Repository } from 'typeorm'

import { CreateImageInput } from './dto/create-image.input'
import { Image } from './entities/image.entity'

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>
  ) {}

  async create(input: CreateImageInput): Promise<Image> {
    const { data: pixels, info: metadata } = await sharp(input.buffer)
      .raw()
      .ensureAlpha()
      .toBuffer({
        resolveWithObject: true
      })
    const clamped = new Uint8ClampedArray(pixels)

    const blurhash = encode(clamped, metadata.width, metadata.height, 4, 4)

    const image = this.imageRepository.create({
      key: input.key,
      blurhash
    })

    return await this.imageRepository.save(image)
  }

  async findOne(input: FindOneOptions<Image>): Promise<Image | null> {
    return await this.imageRepository.findOne({ ...input })
  }

  async delete(id: Image['id']): Promise<Image['id'] | null> {
    const result = await this.imageRepository.delete(id)

    if (result.affected) return id

    return null
  }
}
