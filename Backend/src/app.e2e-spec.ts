import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth + Account (e2e, vitest)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('TC1: register -> access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userA@test.nl',
        password: 'secret12',
        fullName: 'User A',
      })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
  });

  it('TC2/TC3: login success en fout wachtwoord', async () => {
    const ok = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'userA@test.nl', password: 'secret12' })
      .expect(201);

    expect(ok.body.access_token).toBeDefined();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'userA@test.nl', password: 'wrong12' })
      .expect(401);
  });

  it('Security: /account zonder token -> 401', async () => {
    await request(app.getHttpServer())
      .patch('/account')
      .send({ fullName: 'X' })
      .expect(401);
    await request(app.getHttpServer()).delete('/account').expect(401);
  });

  it('TC14: account update met token', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'userA@test.nl', password: 'secret12' })
      .expect(201);

    const token = login.body.access_token;

    const res = await request(app.getHttpServer())
      .patch('/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Nieuwe Naam' })
      .expect(200);

    expect(res.body.fullName).toBe('Nieuwe Naam');
  });

  it('TC17/TC18: account verwijderen -> daarna geen login meer mogelijk', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'userA@test.nl', password: 'secret12' })
      .expect(201);

    const token = login.body.access_token;

    await request(app.getHttpServer())
      .delete('/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'userA@test.nl', password: 'secret12' })
      .expect(401);
  });
});