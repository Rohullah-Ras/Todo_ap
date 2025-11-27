import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import AppModule from '../src/app.module';
import { Task } from '../src/modules/tasks/task.entity';
import { List } from '../src/modules/list/list.entity';
import { Status } from '../src/modules/status/status.entity';

describe('Task module E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let todoStatus: Status;
  let doneStatus: Status;
  let list: List;
  let taskId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

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

    dataSource = moduleRef.get(DataSource);

    // DB opschonen
    await dataSource.getRepository(Task).delete({});
    await dataSource.getRepository(List).delete({});
    await dataSource.getRepository(Status).delete({});

    // statuses seeden
    const statusRepo = dataSource.getRepository(Status);
    todoStatus = statusRepo.create({ id: 1, name: 'todo' });
    const inProgressStatus = statusRepo.create({ id: 2, name: 'in-progress' });
    doneStatus = statusRepo.create({ id: 3, name: 'done' });
    await statusRepo.save([todoStatus, inProgressStatus, doneStatus]);

    // list seeden (eventueel via HTTP, maar repo is prima voor tests)
    const listRepo = dataSource.getRepository(List);
    list = listRepo.create({ name: 'Testlijst' });
    list = await listRepo.save(list);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/tasks -> maakt een nieuwe task in de lijst met status todo', async () => {
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

  it('GET /api/tasks -> bevat de aangemaakte task', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tasks')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    const task = res.body.find((t: any) => t.id === taskId);
    expect(task).toBeDefined();
    expect(task.title).toBe('E2E task');
    expect(task.listId).toBe(list.id);
    expect(task.statusId).toBe(todoStatus.id);
  });

  it('PATCH /api/tasks/:id -> zet task op done', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .send({
        isDone: true,
        statusId: doneStatus.id,
      })
      .expect(200);

    expect(res.body).toHaveProperty('id', taskId);
    expect(res.body).toHaveProperty('isDone', true);
    expect(res.body).toHaveProperty('statusId', doneStatus.id);
  });

  it('DELETE /api/tasks/:id -> verwijdert de task', async () => {
    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskId}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/tasks')
      .expect(200);

    const task = res.body.find((t: any) => t.id === taskId);
    expect(task).toBeUndefined();
  });
});
