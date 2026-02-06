import { Body, Controller, Delete, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Patch()
  update(@CurrentUser() user: any, @Body() dto: UpdateAccountDto) {
    return this.accountService.update(user.id, dto);
  }

  @Delete()
  remove(@CurrentUser() user: any) {
    return this.accountService.remove(user.id);
  }
}
