import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { UserModule } from '@/user/user.module'
import { Services } from '@/utils/constants'

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
  ],
  exports: [Services.AUTH]
})
export class AuthModule {}
