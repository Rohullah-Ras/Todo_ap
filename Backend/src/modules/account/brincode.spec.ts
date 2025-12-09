import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountModule } from './account.module';
import {describe} from "vitest";

describe('brincode:327 vs {}', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AccountModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('(Partial<UpdateAccount1>) struct1 allows extra props and does not strip them or validate them', async () => {
        const res = await request(app.getHttpServer())
            .post('/test-accounts/struct1')
            .send({
                webwinkelId: 123,
                extra: 'not allowed',
            })
            .expect(201);

        // Because the param type is Partial<UpdateAccount1>,
        // Nest reflects it as plain Object -> whitelist cannot apply.
        // So both properties survive.
        expect(res.body.webwinkelId).toBe(123);
        expect(res.body.extra).toBe('not allowed');
    });