import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';

import {StatusesService} from './statuses.service';
import {Status} from './status.entity';

describe('StatusesService (vitest)', () => {
    let service: StatusesService;

    const statusRepo = {
        find: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                StatusesService,
                {provide: getRepositoryToken(Status), useValue: statusRepo},
            ],
        }).compile();

        service = moduleRef.get(StatusesService);
    });

    it('findAll -> haalt alle statussen op gesorteerd op id ASC', async () => {
        statusRepo.find.mockResolvedValue([{id: 1, name: 'todo'}]);

        const res = await service.findAll();

        expect(statusRepo.find).toHaveBeenCalledWith({order: {id: 'ASC'}});
        expect(res).toEqual([{id: 1, name: 'todo'}]);
    });
});