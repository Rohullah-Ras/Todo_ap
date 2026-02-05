import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    fullName?: string;
  }) {
    const exists = await this.users.findByEmail(input.email);
    if (exists) throw new BadRequestException('Email is al in gebruik');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    });

    return this.signToken(user.id, user.email);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Onjuiste login');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Onjuiste login');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const access_token = this.jwt.sign({ sub: userId, email });
    return { access_token };
  }
}
