import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
  ) {}

  findAll(): Promise<Status[]> {
    return this.statusRepo.find({ order: { id: 'ASC' } });
  }
}
