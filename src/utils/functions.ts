import { genSalt, hash } from 'bcrypt'
import { ValidationError } from 'class-validator'

import { IGraphQLErrorMessage } from './types'

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
