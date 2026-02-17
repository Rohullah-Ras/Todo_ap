import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Test} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';
import {NotFoundException} from '@nestjs/common';

import {SpacesService} from './spaces.service';
import {Space} from './space.entity';

describe('SpacesService (vitest)', () => {
    let service: SpacesService;

    const spaceRepo = {
        find: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        softDelete: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                SpacesService,
                {provide: getRepositoryToken(Space), useValue: spaceRepo},
            ],
        }).compile();

        service = moduleRef.get(SpacesService);
    });

    it('FE10: createForUser -> maakt space aan', async () => {
        spaceRepo.create.mockReturnValue({name: 'Mijn space', userId: 'u1'});
        spaceRepo.save.mockResolvedValue({id: 1, name: 'Mijn space', userId: 'u1'});

        const res = await service.createForUser('u1', {name: 'Mijn space'} as any);

        expect(spaceRepo.create).toHaveBeenCalledWith({name: 'Mijn space', userId: 'u1'});
        expect(res.id).toBe(1);
    });

    it('FE9: findAllForUser -> filtert op userId', async () => {
        spaceRepo.find.mockResolvedValue([{id: 1}]);

        const res = await service.findAllForUser('u1');

        expect(spaceRepo.find).toHaveBeenCalledWith({
            where: {userId: 'u1'},
            order: {id: 'DESC'},
        });
        expect(res).toEqual([{id: 1}]);
    });

    it('FE11: softDelete -> NotFound als space niet van user is', async () => {
        spaceRepo.findOne.mockResolvedValue(null);

        await expect(service.softDelete('u1', 5)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('FE11: softDelete -> zet space in trash', async () => {
        spaceRepo.findOne.mockResolvedValue({id: 5, userId: 'u1'});

        const res = await service.softDelete('u1', 5);

        expect(spaceRepo.softDelete).toHaveBeenCalledWith(5);
        expect(res).toEqual({message: 'Space #5 moved to trash'});
    });

    it('hardDelete -> NotFound als space niet bestaat', async () => {
        spaceRepo.findOne.mockResolvedValue(null);

        await expect(service.hardDelete('u1', 5)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('hardDelete -> weigert als space niet in trash zit', async () => {
        spaceRepo.findOne.mockResolvedValue({id: 5, userId: 'u1', deletedAt: null});

        const res = await service.hardDelete('u1', 5);

        expect(res).toEqual({message: 'Space #5 must be in trash before permanent delete'});
        expect(spaceRepo.delete).not.toHaveBeenCalled();
    });

    it('hardDelete -> permanent delete als deletedAt bestaat', async () => {
        spaceRepo.findOne.mockResolvedValue({id: 5, userId: 'u1', deletedAt: new Date()});

        const res = await service.hardDelete('u1', 5);

        expect(spaceRepo.delete).toHaveBeenCalledWith(5);
        expect(res).toEqual({message: 'Space #5 permanently deleted'});
    });

    it('restore -> restore uit trash', async () => {
        spaceRepo.findOne.mockResolvedValue({id: 5, userId: 'u1', deletedAt: new Date()});

        const res = await service.restore('u1', 5);

        expect(spaceRepo.restore).toHaveBeenCalledWith(5);
        expect(res).toEqual({message: 'Space #5 restored'});
    });
});