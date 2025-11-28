import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Go to gym',
    description: 'Title of the task',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3, { message: 'title must be at least 3 characters long' })
  @MaxLength(100, { message: 'title must be at most 100 characters long' })
  @Matches(/[A-Za-z]/, { message: 'title must contain at least one letter' })
  title: string;

  @ApiPropertyOptional({
    example: 'Leg day workout',
    description: 'Optional description of the task',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'description must be at most 500 characters long',
  })
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the list this task belongs to',
  })
  @Type(() => Number)
  @IsInt({ message: 'listId must be an integer' })
  listId: number;

  @ApiProperty({
    example: 2,
    description: 'ID of status (todo, in-progress, done)',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  statusId: number;
}
