import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

const request = require('supertest');

import { initializeNestTestApp } from '../../../test/utils/initialize-nest-test-app';
import AppModule from '../../app.module';
import { List } from './list.entity';
import { Task } from '../tasks/task.entity';

describe('List module E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let listId: number;

  beforeAll(async () => {
    // forRoot runs and provides DataSource
    app = await initializeNestTestApp(AppModule);
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    const taskRepo = dataSource.getRepository(Task);
    const listRepo = dataSource.getRepository(List);

    // Clear tasks first, then lists
    await taskRepo.createQueryBuilder().delete().execute();
    await listRepo.createQueryBuilder().delete().execute();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/lists -> creates a new list', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'Werk' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Werk');

    listId = res.body.id;
  });

  it('GET /api/lists -> contains the created list', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'Thuis' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/lists')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.find((l: any) => l.id === created.body.id);
    expect(found).toBeDefined();
    expect(found.name || found.title).toBe('Thuis');
  });

  it('PATCH /api/lists/:id -> updates list name', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'Oud' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/api/lists/${created.body.id}`)
      .send({ name: 'Nieuw' })
      .expect(200);

    expect(res.body).toHaveProperty('id', created.body.id);
    expect(res.body.name || res.body.title).toBe('Nieuw');
  });

  it('DELETE /api/lists/:id -> deletes the list', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'Te verwijderen' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/lists/${created.body.id}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/lists')
      .expect(200);

    const found = res.body.find((l: any) => l.id === created.body.id);
    expect(found).toBeUndefined();
  });
});
