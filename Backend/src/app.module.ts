import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './modules/tasks/tasks.module';
import { Task } from './modules/tasks/task.entity';
import { ListsModule } from './modules/list/lists.module';
import { List } from './modules/list/list.entity';
import { Status } from './modules/status/status.entity';
import { StatusesModule } from './modules/status/statuses.module';
import { AccountModule } from './modules/account/account.module';

import * as dotenv from 'dotenv';

const isTest = process.env.NODE_ENV === 'test';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 3001),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Welkom01!',
      database:
        process.env.DB_DATABASE || (isTest ? 'Todo_app_test' : 'Todo_app'),
      entities: [Task, List, Status],
      synchronize: isTest || process.env.NODE_ENV === 'development',
      dropSchema: isTest,

      extra: {
        max: 5,
      },
    }),
    TasksModule,
    ListsModule,
    StatusesModule,
    AccountModule,
  ],
})
class AppModule {}

export default AppModule;