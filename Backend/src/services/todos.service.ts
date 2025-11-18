import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodosService {
    constructor(
        @InjectRepository(Todo)
        private readonly todoRepo: Repository<Todo>,
    ) {}

    // CREATE
    async create(createTodoDto: CreateTodoDto): Promise<Todo> {
        const todo = this.todoRepo.create({
            title: createTodoDto.title,
            description: createTodoDto.description,
            isDone: false,
        });
        return this.todoRepo.save(todo);
    }

    // READ ALL
    async findAll(): Promise<Todo[]> {
        return this.todoRepo.find({
            order: { createdAt: 'DESC' },
        });
    }

    // READ ONE
    async findOne(id: number): Promise<Todo> {
        const todo = await this.todoRepo.findOne({ where: { id } });
        if (!todo) {
            throw new NotFoundException(`Task #${id} not found`);
        }
        return todo;
    }

    // UPDATE
    async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
        const todo = await this.findOne(id);

        if (updateTodoDto.title !== undefined) {
            todo.title = updateTodoDto.title;
        }
        if (updateTodoDto.description !== undefined) {
            todo.description = updateTodoDto.description;
        }
        if (updateTodoDto.isDone !== undefined) {
            todo.isDone = updateTodoDto.isDone;
        }

        return this.todoRepo.save(todo);
    }

    // DELETE
    async remove(id: number): Promise<{ message: string }> {
        const todo = await this.findOne(id);
        await this.todoRepo.remove(todo);
        return { message: `Task #${id} removed` };
    }
}
