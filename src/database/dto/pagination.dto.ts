import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  InterfaceType,
  registerEnumType
} from '@nestjs/graphql'
import { IsInt, IsUUID, ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { Node } from '../entities/node.entity'

export enum SortDirection {
  ASC,
  DESC
}

registerEnumType(SortDirection, {
  name: 'SortDirection'
})

@InputType()
export class PaginationSortBy {
  @Field(() => SortDirection, {
    description: 'Sort by date of creation',
    nullable: true
  })
  createdAt?: SortDirection

  @Field(() => SortDirection, {
    description: 'Sort by date of last update',
    nullable: true
  })
  updatedAt?: SortDirection
}

@InputType()
export class PaginationWhere {
  @Field(() => ID, { nullable: true, description: 'Filter by id' })
  @IsUUID('all', { message: 'The id must be a UUID.' })
  @ValidateIf((_o, v) => v !== undefined)
  id?: string
}

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { description: 'Skip the first n nodes' })
  @IsInt({
    message: 'The number of nodes to skip must be an integer'
  })
  skip: number

  @Field(() => Int, { description: 'Take the first n nodes' })
  @IsInt({ message: 'The number of nodes to take must be an integer' })
  take: number

  @Field(() => PaginationSortBy, { description: 'Sort nodes', nullable: true })
  @ValidateNested({ each: true })
  @Type(() => PaginationSortBy)
  sortBy?: PaginationSortBy

  @Field(() => [PaginationWhere], {
    description: 'Filter nodes',
    nullable: 'itemsAndList'
  })
  @ValidateNested({ each: true })
  @Type(() => PaginationWhere)
  where?: PaginationWhere[]
}

@InterfaceType()
export abstract class Pagination<N extends Node = Node> {
  @Field(() => Int, { description: 'Total number of nodes' })
  totalCount: number

  @Field(() => [Node], { description: 'Nodes' })
  abstract nodes: N[]
}
