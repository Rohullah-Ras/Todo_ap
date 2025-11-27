import { Controller, Get, Post, Body } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateListDto } from './dto/create-list.dto';

@ApiTags('lists')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lists (vakantie, school, ...)' })
  findAll() {
    return this.listsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateListDto) {
    return this.listsService.create(dto);
  }
}
