import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { List } from '../list/list.entity';
import { TaskStatus } from '../status/task-status.entity';
import { TaskResponse } from './dto/task-response.dto';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column({ default: false })
  isDone: boolean;

  @Column()
  listId: number;

  @ManyToOne(() => List, (list) => list.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listId' })
  list: List;

  @OneToOne(() => TaskStatus, (ts) => ts.task)
  taskStatus: TaskStatus;

  toResponseObject(): TaskResponse {
    return {
      id: this.id,
      title: this.title,
      description: this.description ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDone: this.isDone,
      listId: this.listId,
      statusId: this.taskStatus?.statusId ?? null,
      listName: this.list?.name,
      statusName: this.taskStatus?.status?.name ?? null,
    };
  }
}