import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createUser(data: { email: string; passwordHash: string; fullName?: string }) {
    const user = this.repo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName ?? null,
    });
    return this.repo.save(user);
  }

  async updateById(
    id: string,
    data: Partial<Pick<User, 'email' | 'passwordHash' | 'fullName'>>,
  ) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);

    if (data.email !== undefined) user.email = data.email;
    if (data.passwordHash !== undefined) user.passwordHash = data.passwordHash;
    if (data.fullName !== undefined) user.fullName = data.fullName;

    return this.repo.save(user);
  }

  async removeById(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    await this.repo.delete(id);
    return { message: `User #${id} deleted` };
  }
}
