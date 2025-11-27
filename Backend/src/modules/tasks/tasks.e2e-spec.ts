import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
const request = require('supertest');

import { initializeNestTestApp } from '../../../test/utils/initialize-nest-test-app';
import AppModule from '../../app.module';
import { List } from '../list/list.entity';
import { Task } from './task.entity';
import { Status } from '../status/status.entity';

describe('Task module E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let todoStatus: Status;
  let doneStatus: Status;
  let list: List;
  let taskId: number;

  beforeAll(async () => {
    app = await initializeNestTestApp(AppModule);
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    const taskRepo = dataSource.getRepository(Task);
    const listRepo = dataSource.getRepository(List);
    const statusRepo = dataSource.getRepository(Status);

    // 1. Clear tables
    await taskRepo.createQueryBuilder().delete().execute();
    await listRepo.createQueryBuilder().delete().execute();
    await statusRepo.createQueryBuilder().delete().execute();

    // 2. Seed statuses
    todoStatus = await statusRepo.save(statusRepo.create({ name: 'todo' }));
    await statusRepo.save(statusRepo.create({ name: 'in-progress' }));
    doneStatus = await statusRepo.save(statusRepo.create({ name: 'done' }));

    // 3. Create a list via HTTP
    const res = await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'Testlijst' })
      .expect(201);

    // 4.
    list = res.body;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/tasks -> creates a task with todo status', async () => {
    const payload = {
      title: 'E2E task',
      description: 'Met status todo',
      listId: list.id,
      statusId: todoStatus.id,
    };

    const res = await request(app.getHttpServer())
      .post('/api/tasks')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', payload.title);
    expect(res.body).toHaveProperty('listId', list.id);
    expect(res.body).toHaveProperty('statusId', todoStatus.id);
    expect(res.body).toHaveProperty('isDone', false);

    taskId = res.body.id;
  });

  it('GET /api/tasks -> contains the created task', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Another task',
        listId: list.id,
        statusId: todoStatus.id,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/tasks')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    const task = res.body.find((t: any) => t.id === created.body.id);
    expect(task).toBeDefined();
    expect(task.title).toBe('Another task');
    expect(task.listId).toBe(list.id);
    expect(task.statusId).toBe(todoStatus.id);
  });

  it('PATCH /api/tasks/:id -> sets task to done', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Te completeren',
        listId: list.id,
        statusId: todoStatus.id,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/api/tasks/${created.body.id}`)
      .send({
        isDone: true,
        statusId: doneStatus.id,
      })
      .expect(200);

    expect(res.body).toHaveProperty('id', created.body.id);
    expect(res.body).toHaveProperty('isDone', true);
    expect(res.body).toHaveProperty('statusId', doneStatus.id);
  });

  it('DELETE /api/tasks/:id -> deletes the task', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Te verwijderen',
        listId: list.id,
        statusId: todoStatus.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${created.body.id}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/tasks')
      .expect(200);

    const found = res.body.find((t: any) => t.id === created.body.id);
    expect(found).toBeUndefined();
  });
});
