import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../spaces/space.entity';
import { Task } from '../tasks/task.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async getSummaryForUser(userId: string) {
    const workspaces = await this.spaceRepo.count({
      where: { userId },
    });

    const rows = await this.taskRepo
      .createQueryBuilder('t')
      .innerJoin('t.list', 'l')
      .innerJoin('l.space', 's')
      .innerJoin('t.taskStatus', 'ts')
      .innerJoin('ts.status', 'st')
      .where('s.userId = :userId', { userId })
      .andWhere('t.deletedAt IS NULL')
      .andWhere('l.deletedAt IS NULL')
      .andWhere('s.deletedAt IS NULL')
      .select('st.name', 'status')
      .addSelect('COUNT(t.id)', 'count')
      .groupBy('st.name')
      .getRawMany<{ status: string; count: string }>();

    const counts = rows.reduce(
      (acc, row) => {
        acc[row.status] = Number(row.count) || 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      workspaces,
      todo: counts['todo'] ?? 0,
      inProgress: counts['in-progress'] ?? 0,
      done: counts['done'] ?? 0,
    };
  }
}
