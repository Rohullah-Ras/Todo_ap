import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { List } from '../list/list.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Status } from '../status/status.entity';
import { TaskResponse } from './dto/task-response.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(List)
    private readonly listRepo: Repository<List>,
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      listId: createTaskDto.listId,
      statusId: createTaskDto.statusId ?? null,
      isDone: createTaskDto.isDone ?? false,
    });

    const saved = await this.taskRepo.save(task);

    // reload with relations for response
    const full = await this.taskRepo.findOne({
      where: { id: saved.id },
      relations: ['list', 'status'],
    });

    if (!full) {
      // ultra-defensive; in practice this should never happen
      throw new NotFoundException(`Task #${saved.id} not found after save`);
    }

    return full.toResponseObject();
  }

  async findAll(): Promise<TaskResponse[]> {
    const tasks = await this.taskRepo.find({
      relations: ['list', 'status'],
      order: { createdAt: 'DESC' },
    });

    return tasks.map((t) => t.toResponseObject());
  }

  async findByList(listId: number): Promise<TaskResponse[]> {
    const tasks = await this.taskRepo.find({
      where: { listId },
      relations: ['list', 'status'],
      order: { createdAt: 'DESC' },
    });

    return tasks.map((t) => t.toResponseObject());
  }

  async findOne(id: number): Promise<TaskResponse> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['list', 'status'],
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return task.toResponseObject();
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['list', 'status'],
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.listId !== undefined) {
      task.listId = updateTaskDto.listId;
    }

    if (updateTaskDto.isDone !== undefined) {
      task.isDone = updateTaskDto.isDone;
    }

    if (updateTaskDto.statusId !== undefined) {
      if (updateTaskDto.statusId === null) {
        task.status = null;
        task.statusId = null;
      } else {
        const status = await this.statusRepo.findOneByOrFail({
          id: updateTaskDto.statusId,
        });

        task.status = status;
        task.statusId = status.id;
      }
    }

    const saved = await this.taskRepo.save(task);

    // reload with relations for final response
    const full = await this.taskRepo.findOne({
      where: { id: saved.id },
      relations: ['list', 'status'],
    });

    if (!full) {
      throw new NotFoundException(`Task #${saved.id} not found after update`);
    }

    return full.toResponseObject();
  }

  async remove(id: number): Promise<{ message: string }> {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    await this.taskRepo.remove(task);

    return { message: `Task #${id} removed` };
  }
}