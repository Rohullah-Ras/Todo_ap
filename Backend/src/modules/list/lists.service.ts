// src/modules/list/lists.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './list.entity';
import { CreateListDto } from './dto/create-list.dto'; // ✅ correct name

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepo: Repository<List>, // ✅ use this everywhere
  ) {}

  // GET /lists
  findAll(): Promise<List[]> {
    return this.listRepo.find({ order: { id: 'ASC' } });
  }

  // helper to generate "key" from the name
  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // spaces -> hyphens
      .replace(/[^a-z0-9-]/g, ''); // remove weird chars
  }

  // POST /lists
  async create(dto: CreateListDto): Promise<List> {
    const key = dto.key || this.slugify(dto.name); // ✅ dto.name, not title

    const list = this.listRepo.create({
      name: dto.name, // ✅ matches List.name
      key,
    });

    return this.listRepo.save(list);
  }
}
