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
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { TaskStatus } from './modules/status/task-status.entity';
import { Space } from './modules/spaces/space.entity';
import { SpacesModule } from './modules/spaces/spaces.module';

const isTest = process.env.NODE_ENV === 'test';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password!',
      database:
        process.env.DB_DATABASE || (isTest ? 'Todo_app_test' : 'Todo_app'),
      entities: [Task, List, Status, TaskStatus, Space, User],
      synchronize: isTest || process.env.NODE_ENV === 'development',
      dropSchema: isTest,
      logging: ['error', 'schema'],

      extra: {
        max: 5,
      },
    }),
    TasksModule,
    ListsModule,
    StatusesModule,
    AccountModule,

    UsersModule,
    AuthModule,

    TasksModule,
    ListsModule,
    StatusesModule,
    AccountModule,
    SpacesModule,
  ],
})
class AppModule {}

export default AppModule;