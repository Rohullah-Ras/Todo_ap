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

@ApiTags('tasks')
@Controller('tasks')
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

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, type: [TaskResponse] })
  findAll() {
    return this.tasksService.findAll();
  }

  // TRASH
  @Get('trash')
  trash() {
    return this.tasksService.trash();
  }

  // RESTORE
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.restore(id);
  }

  // PERMANENT DELETE (2e delete)
  @Delete(':id/permanent')
  removePermanent(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.removePermanent(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, type: TaskResponse })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, type: TaskResponse })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  // 1e delete => soft delete
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task (move to trash)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}