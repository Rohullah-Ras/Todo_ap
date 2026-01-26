import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class MoveTaskDto {
  @ApiProperty({ example: 1, description: 'Target listId' })
  @Type(() => Number)
  @IsInt()
  listId: number;

  @ApiProperty({ example: 2, description: 'Target statusId' })
  @Type(() => Number)
  @IsInt()
  statusId: number;

  @ApiProperty({
    example: 0,
    description: 'New position (0-based) inside the target column',
  })
  @Type(() => Number)
  @IsInt()
  position: number;
}