import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Mijn eerste space' })
  @IsString()
  @IsNotEmpty()
  name: string;
}