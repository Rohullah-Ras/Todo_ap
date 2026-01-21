import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';
import { TaskStatus } from './task-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status, TaskStatus])],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [TypeOrmModule], // belangrijk: zodat andere modules repositories kunnen injecten
})
export class StatusesModule {}