import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { initializeNestTestApp } from '../../shared/test/utils/initialize-nest-test-app';
import AppModule from '../../app.module';
import { User } from '../users/user.entity';
import { Space } from './space.entity';
import { List } from '../list/list.entity';
import { Task } from '../tasks/task.entity';
import { TaskStatus } from '../status/task-status.entity';
import { Status } from '../status/status.entity';

describe('Spaces module E2E', () => {
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

  const registerAndGetToken = async (email = 'spaceuser@example.com') => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'secret123', fullName: 'Space User' })
      .expect(201);
    return res.body.access_token as string;
  };

  it('POST /api/spaces -> creates a space', async () => {
    const token = await registerAndGetToken();
    const res = await request(app.getHttpServer())
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Work Space' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Work Space');
  });

  it('PATCH /api/spaces/:id -> updates a space', async () => {
    const token = await registerAndGetToken('spaceuser2@example.com');
    const created = await request(app.getHttpServer())
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Old Space' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/api/spaces/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Space' })
      .expect(200);

    expect(res.body).toHaveProperty('id', created.body.id);
    expect(res.body).toHaveProperty('name', 'New Space');
  });

  it('DELETE /api/spaces/:id -> deletes a space', async () => {
    const token = await registerAndGetToken('spaceuser3@example.com');
    const created = await request(app.getHttpServer())
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Remove Space' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/spaces/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const found = res.body.find((s: any) => s.id === created.body.id);
    expect(found).toBeUndefined();
  });
});
