import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  // e.g. 'todo', 'in-progress', 'done'
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];
}
