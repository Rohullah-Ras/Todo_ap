import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly usersService: UsersService) {}

  async update(userId: string, dto: UpdateAccountDto) {
    if (dto.email) {
      const exists = await this.usersService.findByEmail(dto.email);
      if (exists && exists.id !== userId) {
        throw new BadRequestException('Email is al in gebruik');
      }
    }

    const updateData: {
      email?: string;
      passwordHash?: string;
      fullName?: string | null;
    } = {};

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;

    if (dto.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.usersService.updateById(userId, updateData);
    return { id: user.id, email: user.email, fullName: user.fullName ?? null };
  }

  remove(userId: string) {
    return this.usersService.removeById(userId);
  }
}
