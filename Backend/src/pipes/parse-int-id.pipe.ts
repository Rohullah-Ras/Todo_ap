import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = Number(value);

    if (!Number.isInteger(val) || val <= 0) {
      throw new BadRequestException('ID must be a positive integer');
    }

    return val;
  }
}