import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { toTrimmedStringOrNull } from '../../../shared/transformers/to-trimmed-string-or-null';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @Transform(toTrimmedStringOrNull)
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'New Strong Pass' })
  @Transform(toTrimmedStringOrNull)
  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Full Name' })
  @Transform(toTrimmedStringOrNull)
  @IsOptional()
  @IsString()
  fullName?: string;
}