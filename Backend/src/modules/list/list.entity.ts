import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  // name: vakantie, school, etc.
  @Column()
  name: string;

  // key used for columns: 'todo', 'in-progress', 'done' (for your current board)
  @Column({ unique: true })
  key: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.list)
  tasks: Task[];
}
