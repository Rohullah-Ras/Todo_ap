import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { initializeNestTestApp } from '../../shared/test/utils/initialize-nest-test-app';
import AppModule from '../../app.module';
import { User } from '../users/user.entity';
import { Space } from '../spaces/space.entity';
import { List } from '../list/list.entity';
import { Task } from '../tasks/task.entity';
import { TaskStatus } from '../status/task-status.entity';
import { Status } from '../status/status.entity';

describe('Account module E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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
  });

  afterAll(async () => {
    await app.close();
  });

  const registerAndGetToken = async (email = 'account@example.com') => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'secret123', fullName: 'Account User' })
      .expect(201);
    return res.body.access_token as string;
  };

  it('creates, updates, and deletes an account', async () => {
    const token = await registerAndGetToken();

    const updateRes = await request(app.getHttpServer())
      .patch('/api/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Updated Name' })
      .expect(200);

    expect(updateRes.body).toHaveProperty('fullName', 'Updated Name');
    expect(updateRes.body).toHaveProperty('email', 'account@example.com');

    await request(app.getHttpServer())
      .delete('/api/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const userRepo = dataSource.getRepository(User);
    const users = await userRepo.find();
    expect(users.length).toBe(0);
  });
});
