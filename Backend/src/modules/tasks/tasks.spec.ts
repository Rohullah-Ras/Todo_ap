import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeNestTestApp } from '../../shared/test/utils/initialize-nest-test-app';
import AppModule from '../../app.module';
import { List } from '../list/list.entity';
import { Task } from './task.entity';
import { Status } from '../status/status.entity';
import { TaskStatus } from '../status/task-status.entity';
import { Space } from '../spaces/space.entity';
import { User } from '../users/user.entity';
import request from 'supertest';

describe('Task module E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let todoStatus: Status;
  let doneStatus: Status;
  let list: List;

  beforeAll(async () => {
    app = await initializeNestTestApp(AppModule);
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    const [{ current_database }] = await dataSource.query(
      'SELECT current_database()',
    );
    if (!current_database.endsWith('_test')) {
      throw new Error(`Refusing to clean database "${current_database}"`);
    }

    await dataSource.getRepository(TaskStatus).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Task).createQueryBuilder().delete().execute();
    await dataSource.getRepository(List).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Space).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Status).createQueryBuilder().delete().execute();
    await dataSource.getRepository(User).createQueryBuilder().delete().execute();

    const statusRepo = dataSource.getRepository(Status);
    await statusRepo.save([
      statusRepo.create({ name: 'todo' }),
      statusRepo.create({ name: 'in-progress' }),
      statusRepo.create({ name: 'done' }),
    ]);

    todoStatus = await statusRepo.findOneByOrFail({ name: 'todo' });
    doneStatus = await statusRepo.findOneByOrFail({ name: 'done' });

    const token = await registerAndGetToken();
    const space = await createSpace(token);
    list = await createList(token, space.id);
  });

  afterAll(async () => {
    await app.close();
  });

  const registerAndGetToken = async (email = 'taskuser@example.com') => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'secret123', fullName: 'Task User' })
      .expect(201);
    return res.body.access_token as string;
  };

  const createSpace = async (token: string, name = 'Task Space') => {
    const res = await request(app.getHttpServer())
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name })
      .expect(201);
    return res.body;
  };

  const createList = async (token: string, spaceId: number) => {
    const res = await request(app.getHttpServer())
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Task List', spaceId })
      .expect(201);
    return res.body;
  };

  it('POST /api/tasks -> creates a task with todo status', async () => {
    const payload = {
      title: 'E2E task',
      description: 'Todo status',
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

    const res = await request(app.getHttpServer()).get('/api/tasks').expect(200);

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
        title: 'Complete me',
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

  it('PATCH /api/tasks/:id/move -> moves task from todo to done', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Move me',
        listId: list.id,
        statusId: todoStatus.id,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/api/tasks/${created.body.id}/move`)
      .send({
        listId: list.id,
        statusId: doneStatus.id,
        position: 0,
      })
      .expect(200);

    expect(res.body).toHaveProperty('id', created.body.id);
    expect(res.body).toHaveProperty('statusId', doneStatus.id);
  });

  it('DELETE /api/tasks/:id -> deletes the task', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Remove me',
        listId: list.id,
        statusId: todoStatus.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${created.body.id}`)
      .expect(200);

    const res = await request(app.getHttpServer()).get('/api/tasks').expect(200);

    const found = res.body.find((t: any) => t.id === created.body.id);
    expect(found).toBeUndefined();
  });
});
