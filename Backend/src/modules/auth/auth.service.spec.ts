import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {JwtService} from '@nestjs/jwt';
import {BadRequestException, UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {AuthService} from './auth.service';
import {UsersService} from '../users/users.service';

vi.mock('bcrypt', () => {
    return {
        default: {
            hash: vi.fn(),
            compare: vi.fn(),
        },
        hash: vi.fn(),
        compare: vi.fn(),
    };
});

describe('AuthService (vitest)', () => {
    let service: AuthService;
    const users = {
        findByEmail: vi.fn(),
        createUser: vi.fn(),
    };
    const jwt = {
        sign: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                {provide: UsersService, useValue: users},
                {provide: JwtService, useValue: jwt},
            ],
        }).compile();

        service = moduleRef.get(AuthService);
    });

    it('register: maakt user aan en geeft token terug', async () => {
        users.findByEmail.mockResolvedValue(null);
        users.createUser.mockResolvedValue({id: 'u1', email: 'userA@test.nl'});
        jwt.sign.mockReturnValue('jwt-token');

        const res = await service.register({
            email: 'userA@test.nl',
            password: 'secret12',
            fullName: 'User A',
        });

        expect(users.findByEmail).toHaveBeenCalledWith('userA@test.nl');
        expect(users.createUser).toHaveBeenCalled();
        expect(res).toEqual({access_token: 'jwt-token'});
    });

    it('register: email bestaat -> BadRequestException', async () => {
        users.findByEmail.mockResolvedValue({id: 'uX'});

        await expect(
            service.register({email: 'userA@test.nl', password: 'secret12'}),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('login: user niet gevonden -> UnauthorizedException', async () => {
        users.findByEmail.mockResolvedValue(null);

        await expect(
            service.login({email: 'userA@test.nl', password: 'secret12'}),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('login: fout wachtwoord -> UnauthorizedException', async () => {
        users.findByEmail.mockResolvedValue({passwordHash: 'hash'});
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

        await expect(
            service.login({email: 'userA@test.nl', password: 'wrong12'}),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('login: correct -> token', async () => {
        users.findByEmail.mockResolvedValue({
            id: 'u1',
            email: 'userA@test.nl',
            passwordHash: 'hash',
        });
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
        jwt.sign.mockReturnValue('jwt-token');

        const res = await service.login({email: 'userA@test.nl', password: 'secret12'});
        expect(res).toEqual({access_token: 'jwt-token'});
    });
});