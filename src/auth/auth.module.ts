import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { UserModule } from '@/user/user.module'
import { Services } from '@/utils/constants'
import { AuthResolver } from './auth.resolver'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_ACCES_TOKEN_SECRET')
      })
    })
  ],
  providers: [
    {
      provide: Services.AUTH,
      useClass: AuthService
    },
    AuthResolver,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy
  ]
})
export class AuthModule {}
