import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { List } from '../list/list.entity';
import { Status } from '../status/status.entity';
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

  @Column({ default: false })
  isDone: boolean;

  @Column()
  listId: number;

  @ManyToOne(() => List, (list) => list.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listId' })
  list: List;

  @Column({ nullable: true })
  statusId: number | null;

  @ManyToOne(() => Status, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'statusId' })
  status: Status | null;

  toResponseObject(): TaskResponse {
    return {
      id: this.id,
      title: this.title,
      description: this.description ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDone: this.isDone,
      listId: this.listId,
      statusId: this.statusId ?? null,
      listName: this.list?.name,
      statusName: this.status?.name ?? null,
    };
  }
}