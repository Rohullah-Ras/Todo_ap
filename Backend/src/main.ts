import { NestFactory } from '@nestjs/core';
import AppModule from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:5173', // your frontend
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove fields not in DTO
      forbidNonWhitelisted: true, // error if unknown field is sent
      transform: true, // auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true, // numbers, booleans, etc.
      },
    }),
  );

  //  Swagger config
  const config = new DocumentBuilder()
    .setTitle('Todo / Tasks API')
    .setDescription('API documentation for the Tasks backend')
    .setVersion('1.0')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(3005, '0.0.0.0');
  console.log(await app.getUrl());
}

bootstrap();
