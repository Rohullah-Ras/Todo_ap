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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskResponse } from './dto/task-response.dto';

@ApiTags('tasks') // groups endpoints in Swagger
@Controller('tasks') // /api/tasks
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, type: TaskResponse })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get('list/:listId')
  @ApiOperation({ summary: 'Get all tasks for a specific list' })
  @ApiResponse({ status: 200, type: [TaskResponse] })
  findByList(@Param('listId', ParseIntPipe) listId: number) {
    return this.tasksService.findByList(listId);
  }

  //  ADDED @Get()
  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, type: [TaskResponse] })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, type: TaskResponse })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (title, description, list, status)' })
  @ApiResponse({ status: 200, type: TaskResponse })
  @ApiResponse({ status: 404, description: 'Task not found' })
  // use dto instead of non-existing updateTaskDto
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task removed' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}