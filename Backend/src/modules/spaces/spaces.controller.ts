import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';

@Controller('spaces')
export class SpacesController {
  private userId = 1; // tijdelijk

  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  findAll() {
    return this.spacesService.findAll(this.userId);
  }

  @Get('trash')
  trash() {
    return this.spacesService.findTrash(this.userId);
  }

  @Post()
  create(@Body() dto: CreateSpaceDto) {
    return this.spacesService.create(this.userId, dto.name);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.spacesService.restore(this.userId, id);
  }

  @Delete(':id')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.spacesService.softDelete(this.userId, id);
  }

  @Delete(':id/permanent')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.spacesService.hardDelete(this.userId, id);
  }
}