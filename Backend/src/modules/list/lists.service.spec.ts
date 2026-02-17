import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';
import {BadRequestException, NotFoundException, UnauthorizedException} from '@nestjs/common';

import {ListsService} from './lists.service';
import {List} from './list.entity';
import {Space} from '../spaces/space.entity';
import {Task} from '../tasks/task.entity';

function makeQueryBuilderMock() {
    const qb: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn(),
    };
    return qb;
}

describe('ListsService (vitest)', () => {
    let service: ListsService;

    const listRepo = {
        find: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        softDelete: vi.fn(),
        restore: vi.fn(),
        delete: vi.fn(),
        createQueryBuilder: vi.fn(),
    };

    const spaceRepo = {
        findOne: vi.fn(),
    };

    const taskRepo = {
        softDelete: vi.fn(),
        restore: vi.fn(),
        delete: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                ListsService,
                {provide: getRepositoryToken(List), useValue: listRepo},
                {provide: getRepositoryToken(Space), useValue: spaceRepo},
                {provide: getRepositoryToken(Task), useValue: taskRepo},
            ],
        }).compile();

        service = moduleRef.get(ListsService);
    });

    it('FE6: create -> Unauthorized als userId ontbreekt', async () => {
        await expect(
            service.create('' as any, {name: 'vakantie', spaceId: 1} as any),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('FE6: create -> NotFound als space niet van user is / niet bestaat', async () => {
        spaceRepo.findOne.mockResolvedValue(null);

        await expect(
            service.create('user-1', {name: 'vakantie', spaceId: 99} as any),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('FE6: create -> slaat list op', async () => {
        spaceRepo.findOne.mockResolvedValue({id: 6, userId: 'user-1'});
        listRepo.create.mockReturnValue({name: 'vakantie', spaceId: 6, key: null});
        listRepo.save.mockResolvedValue({id: 1, name: 'vakantie', spaceId: 6, key: 'x'});

        const res = await service.create('user-1', {name: 'vakantie', spaceId: 6} as any);

        expect(spaceRepo.findOne).toHaveBeenCalledWith({where: {id: 6, userId: 'user-1'}});
        expect(listRepo.create).toHaveBeenCalledWith({name: 'vakantie', key: null, spaceId: 6});
        expect(listRepo.save).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });

    it('FE9: findAllForUser -> gebruikt querybuilder met userId filter', async () => {
        const qb = makeQueryBuilderMock();
        qb.getMany.mockResolvedValue([{id: 1}]);
        listRepo.createQueryBuilder.mockReturnValue(qb);

        const res = await service.findAllForUser('user-1');

        expect(listRepo.createQueryBuilder).toHaveBeenCalledWith('list');
        expect(qb.where).toHaveBeenCalledWith('space.userId = :userId', {userId: 'user-1'});
        expect(res).toEqual([{id: 1}]);
    });

    it('FE9: findBySpace -> NotFound als space niet van user is', async () => {
        spaceRepo.findOne.mockResolvedValue(null);

        await expect(service.findBySpace('user-1', 5)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('FE7: remove -> softDelete tasks + list', async () => {
        listRepo.findOne.mockResolvedValue({id: 7});

        const res = await service.remove(7);

        expect(taskRepo.softDelete).toHaveBeenCalledWith({listId: 7});
        expect(listRepo.softDelete).toHaveBeenCalledWith(7);
        expect(res).toEqual({message: 'List #7 moved to trash'});
    });

    it('restore -> herstelt list + tasks', async () => {
        listRepo.findOne.mockResolvedValue({id: 7, deletedAt: new Date()});

        const res = await service.restore(7);

        expect(listRepo.restore).toHaveBeenCalledWith(7);
        expect(taskRepo.restore).toHaveBeenCalledWith({listId: 7});
        expect(res).toEqual({message: 'List #7 restored'});
    });

    it('removePermanent -> BadRequest als list niet in trash zit', async () => {
        listRepo.findOne.mockResolvedValue({id: 7, deletedAt: null});

        await expect(service.removePermanent(7)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('removePermanent -> delete tasks + list als in trash', async () => {
        listRepo.findOne.mockResolvedValue({id: 7, deletedAt: new Date()});

        const res = await service.removePermanent(7);

        expect(taskRepo.delete).toHaveBeenCalledWith({listId: 7});
        expect(listRepo.delete).toHaveBeenCalledWith(7);
        expect(res).toEqual({message: 'List #7 permanently deleted'});
    });

    it('update -> als naam verandert en geen key meegegeven, genereert slug key', async () => {
        // findOne() wordt intern gebruikt
        listRepo.findOne.mockResolvedValue({id: 1, name: 'oud', key: 'oud', spaceId: 1});

        listRepo.save.mockImplementation(async (x: any) => x);

        const updated = await service.update(1, {name: 'Mijn Nieuwe Lijst'} as any);

        expect(updated.name).toBe('Mijn Nieuwe Lijst');
        expect(updated.key).toBe('mijn-nieuwe-lijst'); // slugify()
    });

    it('update -> als key expliciet is meegegeven, gebruikt die key', async () => {
        listRepo.findOne.mockResolvedValue({id: 1, name: 'oud', key: 'oud', spaceId: 1});
        listRepo.save.mockImplementation(async (x: any) => x);

        const updated = await service.update(1, {name: 'X', key: 'custom'} as any);

        expect(updated.key).toBe('custom');
    });
});