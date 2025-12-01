import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepo: Repository<List>,
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
  async create(dto: CreateListDto): Promise<List> {
    const key = dto.key || this.slugify(dto.name); // based on name

    const list = this.listRepo.create({
      name: dto.name,
      key,
    });

    return this.listRepo.save(list);
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
  async remove(id: number): Promise<{ message: string }> {
    const list = await this.findOne(id);
    await this.listRepo.remove(list);
    return { message: `List #${id} removed` };
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
