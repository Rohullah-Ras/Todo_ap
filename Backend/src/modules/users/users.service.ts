import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  createUser(data: { email: string; passwordHash: string; fullName?: string }) {
    const user = this.repo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName ?? null,
    });
    return this.repo.save(user);
  }
}