import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './modules/tasks/tasks.module';
import { Task } from './modules/tasks/task.entity';
import { ListsModule } from './modules/list/lists.module';
import { List } from './modules/list/list.entity';
import { Status } from './modules/status/status.entity';
import { StatusesModule } from './modules/status/statuses.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 3001,
      username: 'postgres',
      password: 'Welkom01!',
      database: 'Todo_app',
      entities: [Task, List, Status],
      synchronize: true, // auto-create tables in dev

      extra: {
        max: 5,
      },
    }),
    TasksModule,
    ListsModule,
    StatusesModule,
  ],
})
class AppModule {}

export default AppModule;
