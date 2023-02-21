import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CreateMessageInput {
  @Field(() => String, { description: 'Content of the message' })
  content: string
}
