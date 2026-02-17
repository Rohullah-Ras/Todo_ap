import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSpaceDto {
  @ApiPropertyOptional({ example: 'My Space' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  declare name?: string;
}