import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Mark task as done/undone',
  })
  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Move task to another list',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  listId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Change status (todo/in-progress/done)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusId?: number;
}