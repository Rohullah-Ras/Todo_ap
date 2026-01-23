import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NormalizeStringPipe implements PipeTransform {
  constructor(private readonly options: { toLowerCase?: boolean } = {}) {}

  transform(value: any): any {
    if (typeof value !== 'string') return value;

    let result = value.trim();
    if (this.options.toLowerCase) {
      result = result.toLowerCase();
    }
    return result;
  }
}