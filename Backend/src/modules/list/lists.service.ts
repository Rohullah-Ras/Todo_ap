import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { List } from './list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { Space } from '../spaces/space.entity';
import { Task } from '../tasks/task.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepo: Repository<List>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  // GET /lists
  findAll(): Promise<List[]> {
    return this.listRepo.find({ order: { id: 'ASC' } });
  }

  // GET /lists/:id
  async findOne(id: number): Promise<List> {
    const list = await this.listRepo.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException(`List #${id} not found`);
    }

    return list;
  }

  // POST /lists
  async create(userId: number, dto: CreateListDto): Promise<List> {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    const space = await this.spaceRepo.findOne({
      where: { id: dto.spaceId, userId },
    });
    if (!space) {
      throw new NotFoundException(`Space #${dto.spaceId} not found`);
    }

    const list = this.listRepo.create({
      name: dto.name,
      key: dto.key ?? null, // null => BeforeInsert maakt random key
      spaceId: dto.spaceId,
    });

    return this.listRepo.save(list);
  }

  async findBySpace(userId: number, spaceId: number) {
    const space = await this.spaceRepo.findOne({
      where: { id: spaceId, userId },
    });
    if (!space) throw new NotFoundException('Space not found');

    return this.listRepo.find({ where: { spaceId }, order: { id: 'ASC' } });
  }

  // PATCH /lists/:id
  async update(id: number, dto: UpdateListDto): Promise<List> {
    const list = await this.findOne(id);

    if (dto.name !== undefined) {
      list.name = dto.name;

      // If no explicit key is provided, regenerate from name
      if (!dto.key) {
        list.key = this.slugify(dto.name);
      }
    }

    if (dto.key !== undefined) {
      list.key = dto.key;
    }

    return this.listRepo.save(list);
  }

  // DELETE /lists/:id
  async remove(id: number) {
    const list = await this.listRepo.findOne({ where: { id } });
    if (!list) throw new NotFoundException(`List #${id} not found`);

    // tasks + taskStatus mee naar trash
    await this.taskRepo.softDelete({ listId: id });

    await this.listRepo.softDelete(id);
    return { message: `List #${id} moved to trash` };
  }

  async trash() {
    return this.listRepo.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }

  async restore(id: number) {
    const list = await this.listRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!list) throw new NotFoundException(`List #${id} not found`);

    await this.listRepo.restore(id);
    await this.taskRepo.restore({ listId: id });

    return { message: `List #${id} restored` };
  }

  async removePermanent(id: number) {
    const list = await this.listRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!list || !list.deletedAt) {
      throw new BadRequestException('List must be in trash first');
    }

    await this.taskRepo.delete({ listId: id });
    await this.listRepo.delete(id);

    return { message: `List #${id} permanently deleted` };
  }

  // helper to generate "key" from the name
  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // spaces -> hyphens
      .replace(/[^a-z0-9-]/g, ''); // remove weird chars
  }
}