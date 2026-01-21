import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';
import { Space } from '../spaces/space.entity';

@Entity('lists')
@Index(['spaceId', 'key'], { unique: true })
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column({ type: 'varchar', nullable: true })
  key: string | null;

  @Column()
  spaceId: number;

  @ManyToOne(() => Space, (space) => space.lists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spaceId' })
  space: Space;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Task, (task) => task.list)
  tasks: Task[];

  @BeforeInsert()
  setKey() {
    if (!this.key) {
      const base =
        this.name?.trim().toLowerCase().replace(/\s+/g, '-') || 'list';
      const random = Math.random().toString(36).slice(2, 8);
      this.key = `${base}-${random}`;
    }
  }
}