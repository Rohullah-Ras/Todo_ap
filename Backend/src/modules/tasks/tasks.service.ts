import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './task.entity';
import { List } from '../list/list.entity'; // <-- pad checken
import { Status } from '../status/status.entity';
import { TaskStatus } from '../status/task-status.entity';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
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
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepo: Repository<TaskStatus>,
  ) {}

  async create(dto: CreateTaskDto): Promise<TaskResponse> {
    // list must exist
    const list = await this.listRepo.findOne({ where: { id: dto.listId } });
    if (!list) throw new NotFoundException(`List #${dto.listId} not found`);

    // create task
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      listId: dto.listId,
      isDone: dto.isDone ?? false,
    });

    const savedTask = await this.taskRepo.save(task);

    // choose statusId
    let statusId = dto.statusId ?? null;
    if (!statusId) statusId = await this.getDefaultTodoStatusId();

    // status must exist
    await this.statusRepo.findOneByOrFail({ id: statusId });

    // create task status (1 per task)
    await this.taskStatusRepo.save(
      this.taskStatusRepo.create({
        taskId: savedTask.id,
        statusId,
      }),
    );

    // reload full for response
    const full = await this.taskRepo.findOne({
      where: { id: savedTask.id },
      relations: ['list', 'taskStatus', 'taskStatus.status'],
    });

    if (!full) throw new NotFoundException(`Task #${savedTask.id} not found`);

    return full.toResponseObject();
  }

  async findAll(): Promise<TaskResponse[]> {
    const tasks = await this.taskRepo.find({
      relations: ['list', 'taskStatus', 'taskStatus.status'],
      order: { createdAt: 'DESC' },
    });

    return tasks.map((t) => t.toResponseObject());
  }

  async findByList(listId: number): Promise<TaskResponse[]> {
    const tasks = await this.taskRepo.find({
      where: { listId },
      relations: ['list', 'taskStatus', 'taskStatus.status'],
      order: { createdAt: 'DESC' },
    });

    return tasks.map((t) => t.toResponseObject());
  }

  async findOne(id: number): Promise<TaskResponse> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['list', 'taskStatus', 'taskStatus.status'],
    });

    if (!task) throw new NotFoundException(`Task #${id} not found`);
    return task.toResponseObject();
  }

  async update(id: number, dto: UpdateTaskDto): Promise<TaskResponse> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['taskStatus'],
    });

    if (!task) throw new NotFoundException(`Task #${id} not found`);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.isDone !== undefined) task.isDone = dto.isDone;

    if (dto.listId !== undefined) {
      const list = await this.listRepo.findOne({ where: { id: dto.listId } });
      if (!list) throw new NotFoundException(`List #${dto.listId} not found`);
      task.listId = dto.listId;
    }

    await this.taskRepo.save(task);

    // update status (TaskStatus)
    if (dto.statusId !== undefined) {
      const statusId = dto.statusId ?? (await this.getDefaultTodoStatusId());

      await this.statusRepo.findOneByOrFail({ id: statusId });

      let ts = await this.taskStatusRepo.findOne({
        where: { taskId: task.id },
        withDeleted: true,
      });

      if (!ts) {
        ts = this.taskStatusRepo.create({ taskId: task.id, statusId });
      } else {
        if (ts.deletedAt) await this.taskStatusRepo.restore(ts.id);
        ts.statusId = statusId;
      }

      await this.taskStatusRepo.save(ts);
    }

    const full = await this.taskRepo.findOne({
      where: { id: task.id },
      relations: ['list', 'taskStatus', 'taskStatus.status'],
    });

    if (!full) throw new NotFoundException(`Task #${task.id} not found`);
    return full.toResponseObject();
  }

  // 1e delete => soft delete (trash)
  async remove(id: number): Promise<{ message: string }> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task #${id} not found`);

    const ts = await this.taskStatusRepo.findOne({ where: { taskId: id } });
    if (ts) await this.taskStatusRepo.softDelete(ts.id);

    await this.taskRepo.softDelete(id);

    return { message: `Task #${id} moved to trash` };
  }

  // list deleted tasks
  async trash(): Promise<TaskResponse[]> {
    const tasks = await this.taskRepo.find({
      withDeleted: true,
      relations: ['list', 'taskStatus', 'taskStatus.status'],
      order: { createdAt: 'DESC' },
    });

    return tasks.filter((t) => t.deletedAt).map((t) => t.toResponseObject());
  }

  // restore from trash
  async restore(id: number): Promise<{ message: string }> {
    const task = await this.taskRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!task) throw new NotFoundException(`Task #${id} not found`);

    await this.taskRepo.restore(id);

    const ts = await this.taskStatusRepo.findOne({
      where: { taskId: id },
      withDeleted: true,
    });
    if (ts) await this.taskStatusRepo.restore(ts.id);

    return { message: `Task #${id} restored` };
  }

  // 2e delete => hard delete
  async removePermanent(id: number): Promise<{ message: string }> {
    const task = await this.taskRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!task) throw new NotFoundException(`Task #${id} not found`);
    if (!task.deletedAt) {
      return {
        message: `Task #${id} must be in trash before permanent delete`,
      };
    }

    await this.taskRepo.delete(id); // TaskStatus cascades via FK on taskId
    return { message: `Task #${id} permanently deleted` };
  }

  private async getDefaultTodoStatusId(): Promise<number> {
    const todo = await this.statusRepo.findOne({ where: { name: 'todo' } });
    if (!todo) {
      throw new BadRequestException(
        `Status 'todo' not found. Seed statuses table with: todo, in-progress, done.`,
      );
    }
    return todo.id;
  }
}