import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAccount1 {
  @Type(() => Number)
  @IsInt()
  webwinkelId: number;
}

export class UpdateAccount2 {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  webwinkelId?: number | null;
}