import { Controller, Get } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('statuses')
@Controller('statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all statuses (todo, in-progress, done)' })
  findAll() {
    return this.statusesService.findAll();
  }
}
