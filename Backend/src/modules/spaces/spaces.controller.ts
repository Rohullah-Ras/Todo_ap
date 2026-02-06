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
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.spacesService.findAllForUser(user.id);
  }

  @Get('trash')
  trash(@CurrentUser() user: any) {
    return this.spacesService.findTrash(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateSpaceDto) {
    return this.spacesService.createForUser(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(user.id, id, dto);
  }

  @Patch(':id/restore')
  restore(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.spacesService.restore(user.id, id);
  }

  @Delete(':id')
  softDelete(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.spacesService.softDelete(user.id, id);
  }

  @Delete(':id/permanent')
  hardDelete(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.spacesService.hardDelete(user.id, id);
  }
}
