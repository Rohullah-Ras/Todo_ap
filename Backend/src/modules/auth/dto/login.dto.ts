import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { toTrimmedStringOrNull } from '../../../shared/transformers/to-trimmed-string-or-null';

export class LoginDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @Transform(toTrimmedStringOrNull)
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'New Strong Pass' })
  @Transform(toTrimmedStringOrNull)
  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;
}