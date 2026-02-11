import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Starsoft Backend Challenge by @sartodev')
    .setDescription('A selling point of sale application built with NestJS')
    .setVersion(packageJson.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
