import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { List } from '../list/list.entity';
import { Status } from '../status/status.entity';

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
}
