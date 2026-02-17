import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { toTrimmedStringOrNull } from '../../../shared/transformers/to-trimmed-string-or-null';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @Transform(toTrimmedStringOrNull)
  @IsOptional()
  @IsEmail()
  declare email?: string;

  @ApiPropertyOptional({ example: 'New Strong Pass' })
  @Transform(toTrimmedStringOrNull)
  @IsOptional()
  @IsString()
  @MinLength(6)
  declare password?: string;

  @ApiPropertyOptional({ example: 'Full Name' })
  @Transform(toTrimmedStringOrNull)
  @IsOptional()
  @IsString()
  declare fullName?: string | null;
}