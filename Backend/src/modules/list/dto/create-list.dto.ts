import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListDto {
  @ApiProperty({
    example: 'vakantie',
    description: 'Name of the list',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  key?: string;
}
