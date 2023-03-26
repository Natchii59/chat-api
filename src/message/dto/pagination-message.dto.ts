import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { IsDate, IsUUID, ValidateIf, ValidateNested } from 'class-validator'

import { Message } from '../entities/message.entity'
import { Conversation } from '@/conversation/entities/conversation.entity'
import {
  Pagination,
  PaginationArgs,
  PaginationWhere
} from '@/database/dto/pagination.dto'

@InputType()
export class PaginationMessageWhere extends PaginationWhere {
  @Field(() => ID, { description: 'Filter by Conversation Id', nullable: true })
  @IsUUID('4', {
    message: 'The conversationId must be a UUID.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  conversationId?: Conversation['id']

  @Field(() => Date, {
    description: 'Filter by createdAt date',
    nullable: true
  })
  @IsDate({ message: 'The createdAt must be a date.' })
  @ValidateIf((_o, v) => v !== undefined)
  createdAt?: Date
}

@ArgsType()
export class PaginationMessageArgs extends PaginationArgs {
  @Field(() => [PaginationMessageWhere], { nullable: 'itemsAndList' })
  @ValidateNested({ each: true })
  @Type(() => PaginationMessageWhere)
  where?: PaginationMessageWhere[]
}

@ObjectType()
export class PaginationMessage extends Pagination {
  @Field(() => [Message])
  nodes: Message[]
}
