import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import AppModule from '../src/app.module';
import { List } from '../src/modules/list/list.entity';
import { Task } from '../src/modules/tasks/task.entity';

describe('List module E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let listId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // zelfde als in main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    dataSource = moduleRef.get(DataSource);

    // DB schoonmaken wat lists/tasks betreft
    await dataSource.getRepository(Task).delete({});
    await dataSource.getRepository(List).delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/lists -> maakt een nieuwe lijst', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'Werk' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Werk');

    listId = res.body.id;
  });

  it('GET /api/lists -> bevat de aangemaakte lijst', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/lists')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    const list = res.body.find((l: any) => l.id === listId);
    expect(list).toBeDefined();
    expect(list.name).toBe('Werk');
  });

  it('PATCH /api/lists/:id -> update de naam van de lijst', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/lists/${listId}`)
      .send({ name: 'Vakantie' })
      .expect(200);

    expect(res.body).toHaveProperty('id', listId);
    expect(res.body).toHaveProperty('name', 'Vakantie');
  });

  it('DELETE /api/lists/:id -> verwijdert de lijst', async () => {
    await request(app.getHttpServer())
      .delete(`/api/lists/${listId}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/lists')
      .expect(200);

    const list = res.body.find((l: any) => l.id === listId);
    expect(list).toBeUndefined();
  });
});
