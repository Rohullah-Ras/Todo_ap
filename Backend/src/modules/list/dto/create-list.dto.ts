import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateListDto {
  @ApiProperty({ example: 'vakantie', description: 'Name of the list' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 6, description: 'Space ID where this list belongs' })
  @Type(() => Number)
  @IsInt()
  spaceId: number;

  @IsString()
  @IsOptional()
  key?: string;
}