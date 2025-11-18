import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { TodosService } from '../services/todos.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';

// base path = /api/tasks
@Controller('tasks')
export class TodosController {
    constructor(private readonly todosService: TodosService) {}

    // POST /api/tasks
    @Post()
    create(@Body() dto: CreateTodoDto) {
        return this.todosService.create(dto);
    }

    // GET /api/tasks
    @Get()
    findAll() {
        return this.todosService.findAll();
    }

    // GET /api/tasks/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.todosService.findOne(id);
    }

    // PATCH /api/tasks/:id
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTodoDto,
    ) {
        return this.todosService.update(id, dto);
    }

    // DELETE /api/tasks/:id
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.todosService.remove(id);
    }
}
