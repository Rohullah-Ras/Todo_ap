import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { List } from '../list/list.entity';
import { Status } from '../status/status.entity';
import { TaskStatus } from '../status/task-status.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, List, Status, TaskStatus, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}