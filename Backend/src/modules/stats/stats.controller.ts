import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StatsService } from './stats.service';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  summary(@CurrentUser() user: any) {
    return this.statsService.getSummaryForUser(user.id);
  }
}
