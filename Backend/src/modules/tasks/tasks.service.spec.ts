import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';
import {BadRequestException, NotFoundException} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {TasksService} from './tasks.service';
import {Task} from './task.entity';
import {List} from '../list/list.entity';
import {Status} from '../status/status.entity';
import {TaskStatus} from '../status/task-status.entity';

function makeMaxPosQB(maxValue: string) {
    const qb: any = {
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({max: maxValue}),
    };
    return qb;
}

describe('TasksService (vitest)', () => {
    let service: TasksService;

    const taskRepo = {
        find: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        softDelete: vi.fn(),
        restore: vi.fn(),
        delete: vi.fn(),
        createQueryBuilder: vi.fn(),
    };

    const listRepo = {
        findOne: vi.fn(),
    };

    const statusRepo = {
        findOne: vi.fn(),
        findOneByOrFail: vi.fn(),
    };

    const taskStatusRepo = {
        findOne: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        softDelete: vi.fn(),
        restore: vi.fn(),
    };

    // DataSource.transaction mock
    const dataSource = {
        transaction: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                TasksService,
                {provide: DataSource, useValue: dataSource},
                {provide: getRepositoryToken(Task), useValue: taskRepo},
                {provide: getRepositoryToken(List), useValue: listRepo},
                {provide: getRepositoryToken(Status), useValue: statusRepo},
                {provide: getRepositoryToken(TaskStatus), useValue: taskStatusRepo},
            ],
        }).compile();

        service = moduleRef.get(TasksService);
    });

    it('FE2: create -> NotFound als list niet bestaat', async () => {
        listRepo.findOne.mockResolvedValue(null);

        await expect(
            service.create({title: 'Gym', listId: 99} as any),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('FE2: create -> gebruikt default todo status als statusId ontbreekt', async () => {
        listRepo.findOne.mockResolvedValue({id: 1});
        statusRepo.findOne.mockResolvedValue({id: 10, name: 'todo'}); // default todo
        statusRepo.findOneByOrFail.mockResolvedValue({id: 10});

        // max position = -1 => nextPos = 0
        taskRepo.createQueryBuilder.mockReturnValue(makeMaxPosQB('-1'));

        taskRepo.create.mockReturnValue({title: 'Go to gym'});
        taskRepo.save.mockResolvedValue({id: 5});

        taskStatusRepo.create.mockReturnValue({taskId: 5, statusId: 10});
        taskStatusRepo.save.mockResolvedValue({});

        // reload full for response
        const fullTask = {
            id: 5,
            title: 'Go to gym',
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDone: false,
            listId: 1,
            list: {name: 'L1'},
            taskStatus: {statusId: 10, status: {name: 'todo'}},
            toResponseObject() {
                return {id: 5, title: 'Go to gym', listId: 1, statusId: 10, statusName: 'todo', isDone: false};
            },
        };
        taskRepo.findOne.mockResolvedValue(fullTask as any);

        const res = await service.create({title: 'Go to gym', listId: 1} as any);

        expect(statusRepo.findOne).toHaveBeenCalledWith({where: {name: 'todo'}});
        expect(statusRepo.findOneByOrFail).toHaveBeenCalledWith({id: 10});
        expect(res).toMatchObject({id: 5, title: 'Go to gym', statusId: 10});
    });

    it('FE2: create -> BadRequest als todo status niet bestaat', async () => {
        listRepo.findOne.mockResolvedValue({id: 1});
        statusRepo.findOne.mockResolvedValue(null); // todo missing

        await expect(
            service.create({title: 'Go to gym', listId: 1} as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('FE3: update -> NotFound als task niet bestaat', async () => {
        taskRepo.findOne.mockResolvedValue(null);

        await expect(service.update(1, {title: 'X'} as any)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('FE3: update -> zet velden + update status via TaskStatus', async () => {
        taskRepo.findOne.mockResolvedValue({
            id: 1,
            title: 'Old',
            description: 'Old desc',
            isDone: false,
            listId: 1,
            taskStatus: {id: 99, taskId: 1, statusId: 1, deletedAt: null},
        });

        listRepo.findOne.mockResolvedValue({id: 2}); // new list exists

        statusRepo.findOneByOrFail.mockResolvedValue({id: 2}); // status exists
        taskStatusRepo.findOne.mockResolvedValue({id: 99, taskId: 1, statusId: 1, deletedAt: null});

        taskRepo.save.mockResolvedValue({});

        // reload
        taskRepo.findOne.mockResolvedValueOnce({
            id: 1,
            title: 'Old',
            description: 'Old desc',
            isDone: false,
            listId: 1,
            taskStatus: {id: 99, taskId: 1, statusId: 1, deletedAt: null},
        } as any).mockResolvedValueOnce({
            id: 1,
            toResponseObject() {
                return {id: 1, title: 'New', listId: 2, statusId: 2, isDone: true};
            },
        } as any);

        const res = await service.update(1, {title: 'New', isDone: true, listId: 2, statusId: 2} as any);

        expect(listRepo.findOne).toHaveBeenCalledWith({where: {id: 2}});
        expect(statusRepo.findOneByOrFail).toHaveBeenCalledWith({id: 2});
        expect(taskStatusRepo.save).toHaveBeenCalled();
        expect(res).toEqual({id: 1, title: 'New', listId: 2, statusId: 2, isDone: true});
    });

    it('FE4: remove -> softDelete taskStatus en task', async () => {
        taskRepo.findOne.mockResolvedValue({id: 7});
        taskStatusRepo.findOne.mockResolvedValue({id: 55, taskId: 7});

        const res = await service.remove(7);

        expect(taskStatusRepo.softDelete).toHaveBeenCalledWith(55);
        expect(taskRepo.softDelete).toHaveBeenCalledWith(7);
        expect(res).toEqual({message: 'Task #7 moved to trash'});
    });

    it('trash -> geeft alleen deleted tasks terug', async () => {
        taskRepo.find.mockResolvedValue([
            {id: 1, deletedAt: null, toResponseObject: () => ({id: 1})},
            {id: 2, deletedAt: new Date(), toResponseObject: () => ({id: 2})},
        ]);

        const res = await service.trash();
        expect(res).toEqual([{id: 2}]);
    });

    it('removePermanent -> weigert als task niet in trash zit', async () => {
        taskRepo.findOne.mockResolvedValue({id: 1, deletedAt: null});

        const res = await service.removePermanent(1);

        expect(res).toEqual({message: 'Task #1 must be in trash before permanent delete'});
        expect(taskRepo.delete).not.toHaveBeenCalled();
    });

    it('FE5: move -> update listId/position en statusId in transaction', async () => {
        listRepo.findOne.mockResolvedValue({id: 2});
        statusRepo.findOneByOrFail.mockResolvedValue({id: 3});

        // manager mocks
        const managerTaskRepo = {
            findOne: vi.fn().mockResolvedValue({
                id: 1,
                listId: 1,
                position: 0,
                taskStatus: {statusId: 1},
            }),
            createQueryBuilder: vi.fn().mockReturnValue({
                update: vi.fn().mockReturnThis(),
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                execute: vi.fn().mockResolvedValue({}),
            }),
            save: vi.fn().mockResolvedValue({}),
        };

        const managerTaskStatusRepo = {
            save: vi.fn().mockResolvedValue({}),
        };

        const manager = {
            getRepository: (entity: any) => {
                if (entity === Task) return managerTaskRepo;
                if (entity === TaskStatus) return managerTaskStatusRepo;
                throw new Error('unexpected repo');
            },
        };

        // transaction mock: voer callback uit
        (dataSource.transaction as any).mockImplementation(async (cb: any) => cb(manager));

        // na move reload:
        managerTaskRepo.findOne
            .mockResolvedValueOnce({
                id: 1,
                listId: 1,
                position: 0,
                taskStatus: {statusId: 1},
            })
            .mockResolvedValueOnce({
                id: 1,
                toResponseObject: () => ({id: 1, listId: 2, position: 1, statusId: 3}),
            });

        const res = await service.move(1, {listId: 2, statusId: 3, position: 1} as any);

        expect(res).toEqual({id: 1, listId: 2, position: 1, statusId: 3});
        expect(dataSource.transaction).toHaveBeenCalled();
    });

});