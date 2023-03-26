import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { ConversationModule } from './conversation/conversation.module'
import { GatewayModule } from './gateway/gateway.module'
import { ImageModule } from './image/image.module'
import { ImageStorageModule } from './image-storage/image-storage.module'
import { MessageModule } from './message/message.module'
import { UserModule } from './user/user.module'

import { join } from 'path'

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
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_DATABASE'),
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE') === 'true',
        entities: [join(__dirname, '**', '*.entity.{ts,js}')]
      })
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: 'schema.gql',
      fieldResolverEnhancers: ['guards'],
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      formatError: (error) => {
        if (error.extensions.originalError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const originalError = error.extensions.originalError as any

          return {
            ...originalError,
            path: error.path
          }
        }

        return error
      }
    }),
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
