import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  // e.g. 'todo', 'in-progress', 'done'
  @Column({ unique: true })
  name: string;
}
