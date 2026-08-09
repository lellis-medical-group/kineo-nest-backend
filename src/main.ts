import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const configService = app.get(ConfigService);

  const port = configService.get<number>('port', 3000);

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

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port, '0.0.0.0');

  console.log(`Server running at http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});