import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  // name: vakantie, school, etc.
  @Column('varchar')
  name: string;

  // key used for columns: 'todo', 'in-progress', 'done' (for your current board)
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  key: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.list)
  tasks: Task[];

  @BeforeInsert()
  setKey() {
    if (!this.key) {
      const base =
        this.name?.trim().toLowerCase().replace(/\s+/g, '-') || 'list';
      const random = Math.random().toString(36).slice(2, 8); // 6-char suffix
      this.key = `${base}-${random}`;
    }
  }
}