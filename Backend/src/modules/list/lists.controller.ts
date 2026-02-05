import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('lists') // -> /api/lists (because of global "api" prefix)
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll() {
    return this.listsService.findAll();
  }

  @Get('space/:spaceId')
  findBySpace(
    @CurrentUser() user: any,
    @Param('spaceId', ParseIntPipe) spaceId: number,
  ) {
    return this.listsService.findBySpace(user.id, spaceId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateListDto) {
    return this.listsService.create(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateListDto) {
    return this.listsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.listsService.remove(id);
  }

  @Get('trash')
  trash() {
    return this.listsService.trash();
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.listsService.restore(id);
  }

  @Delete(':id/permanent')
  removePermanent(@Param('id', ParseIntPipe) id: number) {
    return this.listsService.removePermanent(id);
  }
}