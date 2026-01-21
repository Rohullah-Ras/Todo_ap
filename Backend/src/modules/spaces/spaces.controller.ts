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

@Controller('spaces')
export class SpacesController {
  // tijdelijk: userId hardcoded totdat we auth guard erop zetten
  private userId = 1;

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
  create(@Body() body: { name: string }) {
    return this.spacesService.create(this.userId, body.name);
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