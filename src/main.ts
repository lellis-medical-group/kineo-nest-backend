import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net'],
          styleSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
          imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
          fontSrc: [`'self'`, 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'data:'],
          connectSrc: [`'self'`, 'api.scalar.com'],
        },
      },
    }),
  );



  const configService = app.get(ConfigService);

  if (configService.get<boolean>('trustProxy', false)) {
    app.set('trust proxy', 1);
  }

  const port = configService.get<number>('port', 3000);

  const corsOrigins = configService.get<string[]>('cors.origins', []);

  app.enableCors({
    origin: corsOrigins,
    credentials: configService.get<boolean>('cors.credentials', true),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('swagger.title', 'Kineo API'))
    .setDescription(
      configService.get<string>(
        'swagger.description',
        'Kineo API documentation',
      ),
    )
    .setVersion(configService.get<string>('swagger.version', '1.0'))
    .addTag(configService.get<string>('swagger.tag', 'Kineo'))
    .build();

  const documentFactory = () => cleanupOpenApiDoc(SwaggerModule.createDocument(app, swaggerConfig));

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port, '0.0.0.0');

  console.log(`Server running at http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});