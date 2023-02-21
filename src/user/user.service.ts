import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'
import { User } from './entities/user.entity'
import { hashData } from '@/utils/functions'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    if (await this.userRepository.findOneBy({ username: input.username })) {
      throw new BadRequestException([
        {
          field: 'username',
          message: 'The username already exists.'
        }
      ])
    }

    const passwordHash = await hashData(input.password)

    const user = this.userRepository.create({
      ...input,
      password: passwordHash
    })

    return await this.userRepository.save(user)
  }

  async findOne(input: FindOptionsWhere<User>): Promise<User | null> {
    return await this.userRepository.findOneBy({ ...input })
  }

  async update(id: User['id'], input: UpdateUserInput): Promise<User | null> {
    if (input.password) input.password = await hashData(input.password)

    const result = await this.userRepository.update(id, input)

    if (result.affected) return await this.userRepository.findOneBy({ id })

    return null
  }

  async delete(id: User['id']): Promise<User['id'] | null> {
    const result = await this.userRepository.delete(id)

    if (result.affected) return id

    return null
  }
}
