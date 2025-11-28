import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import {ListsService} from './lists.service';
import {CreateListDto} from './dto/create-list.dto';

// import { UpdateListDto } from './dto/update-list.dto';

@Controller('lists') // -> /api/lists (because of global "api" prefix)
export class ListsController {
    constructor(private readonly listsService: ListsService) {
    }

    @Get()
    findAll() {
        return this.listsService.findAll();
    }

    @Post()
    create(@Body() dto: CreateListDto) {
        return this.listsService.create(dto);
    }


    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateListDto) {
        return this.listsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.listsService.remove(id);
    }
}
  