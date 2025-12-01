import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateListDto {
  @ApiPropertyOptional({
    example: 'vakantie',
    description: 'Updated name of the list',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'todo',
    description: 'Updated key of the list',
  })
  @IsString()
  @IsOptional()
  key?: string;
}
