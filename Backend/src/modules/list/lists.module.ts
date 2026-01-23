import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './list.entity';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { Space } from '../spaces/space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List, Space])],
  providers: [ListsService],
  controllers: [ListsController],
  exports: [ListsService],
})
export class ListsModule {}