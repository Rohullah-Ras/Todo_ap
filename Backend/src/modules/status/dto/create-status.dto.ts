import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatusDto {
  @ApiProperty({
    example: 'todo',
    description: 'Name of the status (todo, in-progress, done)',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
