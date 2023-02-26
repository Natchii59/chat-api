import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { IsUUID, ValidateIf, ValidateNested } from 'class-validator'

import { Message } from '../entities/message.entity'
import {
  Pagination,
  PaginationArgs,
  PaginationWhere
} from '@/database/dto/pagination.dto'
import { Conversation } from '@/conversation/entities/conversation.entity'
import { Type } from 'class-transformer'

@InputType()
export class PaginationMessageWhere extends PaginationWhere {
  @Field(() => ID, { description: 'Filter by Conversation Id', nullable: true })
  @IsUUID('all', {
    message: 'The conversationId must be a UUID.'
  })
  @ValidateIf((_o, v) => v !== undefined)
  conversationId?: Conversation['id']
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
