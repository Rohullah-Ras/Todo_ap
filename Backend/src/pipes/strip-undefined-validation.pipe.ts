import { ArgumentMetadata } from '@nestjs/common';
import { AppValidationPipe } from './app-validation.pipe';

export class StripUndefinedValidationPipe extends AppValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    const transformed = await super.transform(value, metadata);

    // Only manipulate objects (and not null)
    if (transformed && typeof transformed === 'object') {
      for (const key of Object.keys(transformed)) {
        if (transformed[key] === undefined) {
          delete transformed[key];
        }
      }
    }

    return transformed;
  }
}