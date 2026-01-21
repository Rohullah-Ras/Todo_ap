import { NestFactory } from '@nestjs/core';
import AppModule from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppValidationPipe } from './pipes/app-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:5173', // your frontend
  });

  app.useGlobalPipes(
    new AppValidationPipe(),
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,

      // foutdata niet te “leaky”
      // validationError: {
      //   target: false, // stuur DTO object zelf niet terug in error
      //   value: true,
      // },
      transformOptions: {
        enableImplicitConversion: true,
        exposeUnsetFields: false,
      },
      validateCustomDecorators: true,

      validationError: {
        target: false, // Don't expose the original object
        value: false, // Don't expose the raw value
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