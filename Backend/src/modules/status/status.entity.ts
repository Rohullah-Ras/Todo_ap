import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  // 'todo', 'in-progress', 'done'
  @Column({ unique: true })
  name: string;
}