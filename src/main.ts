import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'

import { AppModule } from './app.module'
import { formatErrorMessages } from './utils/functions'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory(errors) {
        const messages = formatErrorMessages(errors)
        return new BadRequestException(messages)
      },
      transform: true
    })
  )

  app.use(graphqlUploadExpress({ maxFileSize: 1024 ** 2 * 20 }))

  app.use(cookieParser())

  app.enableCors({
    origin: [process.env.CLIENT_URL],
    credentials: true
  })

  await app.listen(process.env.PORT)
}
bootstrap()
