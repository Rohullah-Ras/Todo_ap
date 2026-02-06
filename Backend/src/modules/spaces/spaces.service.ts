import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './space.entity';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
  ) {}

  findAllForUser(userId: string) {
    return this.spaceRepo.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  createForUser(userId: string, dto: CreateSpaceDto) {
    const space = this.spaceRepo.create({
      name: dto.name,
      userId,
    });
    return this.spaceRepo.save(space);
  }

  findAll(userId: string) {
    return this.spaceRepo.find({
      where: { userId },
      order: { id: 'ASC' },
    });
  }

  async create(userId: string, name: string) {
    const space = this.spaceRepo.create({ name, userId });
    return this.spaceRepo.save(space);
  }

  // 1e delete -> soft delete (naar trash)
  async softDelete(userId: string, id: number) {
    const space = await this.spaceRepo.findOne({ where: { id, userId } });
    if (!space) throw new NotFoundException(`Space #${id} not found`);
    await this.spaceRepo.softDelete(id);
    return { message: `Space #${id} moved to trash` };
  }

  async update(userId: string, id: number, dto: UpdateSpaceDto) {
    const space = await this.spaceRepo.findOne({ where: { id, userId } });
    if (!space) throw new NotFoundException(`Space #${id} not found`);

    if (dto.name !== undefined) {
      space.name = dto.name;
    }

    return this.spaceRepo.save(space);
  }

  // 2e delete -> permanent (alleen als al soft-deleted)
  async hardDelete(userId: string, id: number) {
    const space = await this.spaceRepo.findOne({
      where: { id, userId },
      withDeleted: true,
    });

    if (!space) throw new NotFoundException(`Space #${id} not found`);
    if (!space.deletedAt) {
      return {
        message: `Space #${id} must be in trash before permanent delete`,
      };
    }

    await this.spaceRepo.delete(id);
    return { message: `Space #${id} permanently deleted` };
  }

  // Trash list
  async findTrash(userId: string) {
    const all = await this.spaceRepo.find({
      where: { userId },
      withDeleted: true,
    });
    return all.filter((s) => s.deletedAt);
  }

  // Restore uit trash
  async restore(userId: string, id: number) {
    const space = await this.spaceRepo.findOne({
      where: { id, userId },
      withDeleted: true,
    });
    if (!space) throw new NotFoundException(`Space #${id} not found`);
    await this.spaceRepo.restore(id);
    return { message: `Space #${id} restored` };
  }
}
