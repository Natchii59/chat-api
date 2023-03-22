import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Column, Entity } from 'typeorm'

import { Node } from '@/database/entities/node.entity'

@Entity()
@ObjectType()
export class Image extends Node {
  @Column({ unique: true })
  @Field(() => ID, { description: 'Key of image' })
  key: string

  @Column()
  @Field(() => String, { description: 'Blurhash of image' })
  blurhash: string
}
