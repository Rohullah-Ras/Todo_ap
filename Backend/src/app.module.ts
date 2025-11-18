import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosModule } from './modules/todos.module';
import { Todo } from './entities/todo.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'Welkom01!',
            database: 'todo_app',
            entities: [Todo],
            synchronize: true,
        }),
        TodosModule,
    ],
})
export class AppModule {}
