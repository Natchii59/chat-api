import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { IGraphQLError } from './utils/types'
import { MessageModule } from './message/message.module'
import { ConversationModule } from './conversation/conversation.module'
import { GatewayModule } from './gateway/gateway.module'
import { ImageStorageModule } from './image-storage/image-storage.module'
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: parseInt(configService.getOrThrow('DB_PORT')),
        username: configService.getOrThrow('DB_USERNAME'),
        database: configService.getOrThrow('DB_DATABASE'),
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE') === 'true',
        entities: [join(__dirname, '**', '*.entity.{ts,js}')]
      })
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      formatError: (error) => {
        if (error.extensions.response) {
          return error.extensions.response as IGraphQLError
        }

        return error
      }
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    MessageModule,
    ConversationModule,
    GatewayModule,
    ImageStorageModule,
    ImageModule
  ]
})
export class AppModule {}
