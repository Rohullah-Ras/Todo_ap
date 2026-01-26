import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Task } from './task.entity';
import { List } from '../list/list.entity'; // <-- pad checken
import { Status } from '../status/status.entity';
import { TaskStatus } from '../status/task-status.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponse } from './dto/task-response.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly dataSource: DataSource,
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

    // choose statusId
    let statusId = dto.statusId ?? null;
    if (!statusId) statusId = await this.getDefaultTodoStatusId();

    // status must exist
    await this.statusRepo.findOneByOrFail({ id: statusId });

    // next position in this column (listId + statusId)
    const { max } = await this.taskRepo
      .createQueryBuilder('t')
      .leftJoin('t.taskStatus', 'ts')
      .select('COALESCE(MAX(t.position), -1)', 'max')
      .where('t.listId = :listId', { listId: dto.listId })
      .andWhere('t.deletedAt IS NULL')
      .andWhere('ts.deletedAt IS NULL')
      .andWhere('ts.statusId = :statusId', { statusId })
      .getRawOne<{ max: string }>();

    const nextPos = Number(max) + 1;

    // create task
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      listId: dto.listId,
      isDone: dto.isDone ?? false,
      position: nextPos,
    });

    const savedTask = await this.taskRepo.save(task);

    // create task status
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

  async move(id: number, dto: MoveTaskDto) {
    // validate target list/status exist
    const list = await this.listRepo.findOne({ where: { id: dto.listId } });
    if (!list) throw new NotFoundException(`List #${dto.listId} not found`);

    await this.statusRepo.findOneByOrFail({ id: dto.statusId });

    return this.dataSource.transaction(async (manager) => {
      const taskRepo = manager.getRepository(Task);
      const taskStatusRepo = manager.getRepository(TaskStatus);

      const task = await taskRepo.findOne({
        where: { id },
        relations: ['taskStatus'],
      });

      if (!task) throw new NotFoundException(`Task #${id} not found`);
      if (!task.taskStatus)
        throw new NotFoundException(`TaskStatus for Task #${id} not found`);

      const fromListId = task.listId;
      const fromStatusId = task.taskStatus.statusId;
      const fromPos = task.position;

      const toListId = dto.listId;
      const toStatusId = dto.statusId;
      const toPos = Math.max(0, dto.position);

      const sameColumn = fromListId === toListId && fromStatusId === toStatusId;

      // 1) Close gap in source column
      // decrement positions > fromPos
      await taskRepo
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => `"position" - 1` })
        .where(`"listId" = :listId`, { listId: fromListId })
        .andWhere(`"deletedAt" IS NULL`)
        .andWhere(`"position" > :fromPos`, { fromPos })
        .andWhere(
          `id IN (
          SELECT t.id FROM tasks t
          JOIN task_statuses ts ON ts."taskId" = t.id
          WHERE ts."deletedAt" IS NULL AND ts."statusId" = :fromStatusId
        )`,
          { fromStatusId },
        )
        .execute();

      // 2) Make room in target column
      // increment positions >= toPos
      await taskRepo
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => `"position" + 1` })
        .where(`"listId" = :listId`, { listId: toListId })
        .andWhere(`"deletedAt" IS NULL`)
        .andWhere(`"position" >= :toPos`, { toPos })
        .andWhere(
          `id IN (
          SELECT t.id FROM tasks t
          JOIN task_statuses ts ON ts."taskId" = t.id
          WHERE ts."deletedAt" IS NULL AND ts."statusId" = :toStatusId
        )`,
          { toStatusId },
        )
        .execute();

      // 3) Update the moved task to new column + new position
      task.listId = toListId;
      task.position = toPos;

      await taskRepo.save(task);

      if (!sameColumn) {
        task.taskStatus.statusId = toStatusId;
        await taskStatusRepo.save(task.taskStatus);
      }

      const full = await taskRepo.findOne({
        where: { id: task.id },
        relations: ['list', 'taskStatus', 'taskStatus.status'],
      });

      if (!full)
        throw new NotFoundException(`Task #${task.id} not found after move`);

      return full.toResponseObject();
    });
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