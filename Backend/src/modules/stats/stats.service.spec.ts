import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';

import {StatsService} from './stats.service';
import {Space} from '../spaces/space.entity';
import {Task} from '../tasks/task.entity';

function makeQBMock() {
    const qb: any = {
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn(),
    };
    return qb;
}

describe('StatsService (vitest)', () => {
    let service: StatsService;

    const spaceRepo = {
        count: vi.fn(),
    };

    const taskRepo = {
        createQueryBuilder: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                StatsService,
                {provide: getRepositoryToken(Space), useValue: spaceRepo},
                {provide: getRepositoryToken(Task), useValue: taskRepo},
            ],
        }).compile();

        service = moduleRef.get(StatsService);
    });

    it('FE13: summary -> geeft workspaces en status counts terug (incl. defaults 0)', async () => {
        spaceRepo.count.mockResolvedValue(3);

        const qb = makeQBMock();
        qb.getRawMany.mockResolvedValue([
            {status: 'todo', count: '5'},
            {status: 'in-progress', count: '2'},
            // done ontbreekt expres -> moet 0 worden
        ]);
        taskRepo.createQueryBuilder.mockReturnValue(qb);

        const res = await service.getSummaryForUser('user-1');

        expect(spaceRepo.count).toHaveBeenCalledWith({where: {userId: 'user-1'}});
        expect(taskRepo.createQueryBuilder).toHaveBeenCalledWith('t');
        expect(qb.where).toHaveBeenCalledWith('s.userId = :userId', {userId: 'user-1'});

        expect(res).toEqual({
            workspaces: 3,
            todo: 5,
            inProgress: 2,
            done: 0,
        });
    });

    it('FE13: summary -> zet ongeldige counts om naar 0', async () => {
        spaceRepo.count.mockResolvedValue(1);

        const qb = makeQBMock();
        qb.getRawMany.mockResolvedValue([
            {status: 'done', count: 'not-a-number'}, // Number(...) -> NaN -> || 0
        ]);
        taskRepo.createQueryBuilder.mockReturnValue(qb);

        const res = await service.getSummaryForUser('user-1');

        expect(res).toEqual({
            workspaces: 1,
            todo: 0,
            inProgress: 0,
            done: 0,
        });
    });
});