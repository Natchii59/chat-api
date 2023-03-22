import { genSalt, hash } from 'bcrypt'
import { ValidationError } from 'class-validator'
import * as sharp from 'sharp'

import { FileUpload, IGraphQLErrorMessage } from './types'

export async function hashData(data: string): Promise<string> {
  const SALT = await genSalt()
  return await hash(data, SALT)
}

export function formatErrorMessages(
  errors: ValidationError[],
  messages: IGraphQLErrorMessage[] = []
): IGraphQLErrorMessage[] {
  errors.forEach((error) => {
    if (error.children.length > 0) {
      return formatErrorMessages(error.children, messages)
    } else {
      const msg = Object.values(error.constraints)[0]
      messages.push({ code: error.property, message: msg })
    }
  })

  return messages
}

export function formatImage(
  file: Promise<FileUpload>,
  width: number,
  height?: number
): Promise<Buffer> {
  return new Promise(async (resolve) => {
    const { createReadStream } = await file
    const avatarStream = createReadStream()
    const sharpTransform = sharp()
      .resize(width, height ?? width)
      .webp()

    avatarStream.pipe(sharpTransform)
    const buffer = await sharpTransform.toBuffer()

    resolve(buffer)
  })
}
