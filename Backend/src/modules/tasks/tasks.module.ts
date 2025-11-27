import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { List } from '../list/list.entity';
import { Status } from '../status/status.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, List, Status])],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
