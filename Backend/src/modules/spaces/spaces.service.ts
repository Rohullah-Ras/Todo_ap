import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './space.entity';
import { CreateSpaceDto } from './dto/create-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
  ) {}

  findAllForUser(userId: number) {
    return this.spaceRepo.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  createForUser(userId: number, dto: CreateSpaceDto) {
    const space = this.spaceRepo.create({
      name: dto.name,
      userId,
    });
    return this.spaceRepo.save(space);
  }

  findAll(userId: number) {
    return this.spaceRepo.find({
      where: { userId },
      order: { id: 'ASC' },
    });
  }

  async create(userId: number, name: string) {
    const space = this.spaceRepo.create({ name, userId });
    return this.spaceRepo.save(space);
  }

  // 1e delete -> soft delete (naar trash)
  async softDelete(userId: number, id: number) {
    const space = await this.spaceRepo.findOne({ where: { id, userId } });
    if (!space) throw new NotFoundException(`Space #${id} not found`);
    await this.spaceRepo.softDelete(id);
    return { message: `Space #${id} moved to trash` };
  }

  // 2e delete -> permanent (alleen als al soft-deleted)
  async hardDelete(userId: number, id: number) {
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
  async findTrash(userId: number) {
    const all = await this.spaceRepo.find({
      where: { userId },
      withDeleted: true,
    });
    return all.filter((s) => s.deletedAt);
  }

  // Restore uit trash
  async restore(userId: number, id: number) {
    const space = await this.spaceRepo.findOne({
      where: { id, userId },
      withDeleted: true,
    });
    if (!space) throw new NotFoundException(`Space #${id} not found`);
    await this.spaceRepo.restore(id);
    return { message: `Space #${id} restored` };
  }
}