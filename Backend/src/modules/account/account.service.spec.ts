import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {BadRequestException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {AccountService} from './account.service';
import {UsersService} from '../users/users.service';

vi.mock('bcrypt', () => {
    return {
        default: {
            hash: vi.fn(),
            compare: vi.fn(),
        },
        // voor het geval je code named exports gebruikt:
        hash: vi.fn(),
        compare: vi.fn(),
    };
});

describe('AccountService (vitest)', () => {
    let service: AccountService;

    const users = {
        findByEmail: vi.fn(),
        updateById: vi.fn(),
        removeById: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                AccountService,
                {provide: UsersService, useValue: users},
            ],
        }).compile();

        service = moduleRef.get(AccountService);
    });

    it('update: email al in gebruik door ander -> BadRequestException', async () => {
        users.findByEmail.mockResolvedValue({id: 'other'});

        await expect(
            service.update('me', {email: 'taken@test.nl'} as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('update: password wordt gehashed en opgeslagen als passwordHash', async () => {
        users.findByEmail.mockResolvedValue(null);
        vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed123' as any);
        users.updateById.mockResolvedValue({id: 'me', email: 'me@test.nl', fullName: null});

        const res = await service.update('me', {password: 'secret12'} as any);

        expect(bcrypt.hash).toHaveBeenCalledWith('secret12', 10);
        expect(users.updateById).toHaveBeenCalledWith(
            'me',
            expect.objectContaining({passwordHash: 'hashed123'}),
        );
        expect(res).toEqual({id: 'me', email: 'me@test.nl', fullName: null});
    });

    it('remove: roept removeById aan', async () => {
        users.removeById.mockResolvedValue({ok: true});

        const res = await service.remove('me');
        expect(users.removeById).toHaveBeenCalledWith('me');
        expect(res).toEqual({ok: true});
    });
});