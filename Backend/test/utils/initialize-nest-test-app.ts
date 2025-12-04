import { INestApplication, Type, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import dotenv from 'dotenv';

import 'reflect-metadata';

dotenv.config({ path: `.env.test` });
process.env.NODE_ENV = 'test';

export async function initializeNestTestApp<TModule>(
  module: Type<TModule>,
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [module],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  return app;
}