import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from '../spaces/space.entity';
import { Task } from '../tasks/task.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Space, Task])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
