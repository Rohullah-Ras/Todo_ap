import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { describe, expect, it } from 'vitest';

class AccountDto {
  @IsInt()
  id: number;

  @IsString()
  @MinLength(3)
  name: string;
}

class OptionalDto {
  @IsOptional()
  @IsInt()
  webwinkelId?: number;
}

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// 1) AppValidationPipe: "secure default" wrapper
class AppValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
        ...options?.transformOptions,
      },
      validationError: {
        target: false,
        value: false,
        ...options?.validationError,
      },
      ...options,
    });
  }
}

// 2) StripUndefinedValidationPipe: haalt undefined properties weg
class StripUndefinedValidationPipe extends AppValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    const transformed = await super.transform(value, metadata);

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

// 3) ParseIntIdPipe: veilige ID (positive int)
@Injectable()
class ParseIntIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = Number(value);

    if (!Number.isInteger(val) || val <= 0) {
      throw new BadRequestException('ID must be a positive integer');
    }

    return val;
  }
}

// 4) NormalizeStringPipe: trim + optioneel lowercase
@Injectable()
class NormalizeStringPipe implements PipeTransform {
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

describe('Own validation pipes', () => {
  it('AppValidationPipe: valideert en transformeert AccountDto (id "1" -> 1)', async () => {
    const pipe = new AppValidationPipe();

    const result = await pipe.transform(
      { id: '1', name: 'John' },
      { type: 'body', metatype: AccountDto, data: '' },
    );

    expect(result).toBeInstanceOf(AccountDto);
    expect(result.id).toBe(1);
    expect(typeof result.id).toBe('number');
    expect(result.name).toBe('John');
  });

  it('AppValidationPipe: weigert extra velden (forbidNonWhitelisted)', async () => {
    const pipe = new AppValidationPipe();

    await expect(
      pipe.transform(
        { id: 1, name: 'John', role: 'admin' },
        { type: 'body', metatype: AccountDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('AppValidationPipe: weigert onzinwaarden zonder fatsoenlijk object (forbidUnknownValues)', async () => {
    const pipe = new AppValidationPipe();

    await expect(
      pipe.transform('niet eens een object', {
        type: 'body',
        metatype: AccountDto,
        data: '',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exposeUnsetFields:false: optionele props die niet zijn meegestuurd krijgen geen key', async () => {
    const pipe = new StripUndefinedValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        exposeUnsetFields: false,
      },
    });

    const result = await pipe.transform(
      {},
      { type: 'body', metatype: OptionalDto, data: '' },
    );

    // for (const key of Object.keys(result)) {
    //   if (result[key] === undefined) {
    //     delete result[key];
    //   }
    // }

    // key bestaat NIET
    expect(Object.prototype.hasOwnProperty.call(result, 'webwinkelId')).toBe(
      false,
    );
    expect(result.webwinkelId).toBeUndefined();
  });

  it('StripUndefinedValidationPipe: optionele props die NIET zijn meegestuurd krijgen GEEN key', async () => {
    const pipe = new StripUndefinedValidationPipe();

    const result = await pipe.transform(
      {},
      { type: 'body', metatype: OptionalDto, data: '' },
    );

    expect(result).toBeInstanceOf(OptionalDto);

    //  key bestaat NIET
    expect(Object.prototype.hasOwnProperty.call(result, 'webwinkelId')).toBe(
      false,
    );
    // maar het lezen is nog steeds undefined (normaal TS-gedrag)
    expect(result.webwinkelId).toBeUndefined();
  });

  it('StripUndefinedValidationPipe: als webwinkelId WÉL is meegestuurd, blijft de key en wordt het een nummer', async () => {
    const pipe = new StripUndefinedValidationPipe();

    const result = await pipe.transform(
      { webwinkelId: '123' },
      { type: 'body', metatype: OptionalDto, data: '' },
    );

    expect(result).toBeInstanceOf(OptionalDto);
    expect(result.webwinkelId).toBe(123);
    expect(typeof result.webwinkelId).toBe('number');

    expect(Object.prototype.hasOwnProperty.call(result, 'webwinkelId')).toBe(
      true,
    );
  });

  // debuger fixing

  it('StripUndefinedValidationPipe: optionele props die NIET zijn meegestuurd krijgen GEEN key', async () => {
    console.log('*** TEST STARTED ***');

    debugger;

    const pipe = new StripUndefinedValidationPipe();

    const result = await pipe.transform(
      {},
      { type: 'body', metatype: OptionalDto, data: '' },
    );

    console.log('*** RESULT ***', result);

    expect(Object.prototype.hasOwnProperty.call(result, 'webwinkelId')).toBe(
      false,
    );
  });

  it('vergelijking: standaard ValidationPipe vs StripUndefinedValidationPipe (op dezelfde DTO)', async () => {
    const standardPipe = new ValidationPipe({
      transform: true,
      whitelist: true,
    });

    const customPipe = new StripUndefinedValidationPipe();

    const standardResult = await standardPipe.transform(
      {},
      { type: 'body', metatype: OptionalDto, data: '' },
    );

    const customResult = await customPipe.transform(
      {},
      { type: 'body', metatype: OptionalDto, data: '' },
    );

    // key bestaat, maar is undefined
    expect(
      Object.prototype.hasOwnProperty.call(standardResult, 'webwinkelId'),
    ).toBe(true);
    expect(standardResult.webwinkelId).toBeUndefined();

    // custom: key bestaat NIET meer
    expect(
      Object.prototype.hasOwnProperty.call(customResult, 'webwinkelId'),
    ).toBe(false);
    expect(customResult.webwinkelId).toBeUndefined();
  });

  it('ParseIntIdPipe: accepteert positieve integers', () => {
    const pipe = new ParseIntIdPipe();

    expect(pipe.transform('1')).toBe(1);
    expect(pipe.transform('42')).toBe(42);
  });

  it('ParseIntIdPipe: gooit fout bij niet-getallen of <=0', () => {
    const pipe = new ParseIntIdPipe();

    expect(() => pipe.transform('abc')).toThrow(BadRequestException);
    expect(() => pipe.transform('0')).toThrow(BadRequestException);
    expect(() => pipe.transform('-5')).toThrow(BadRequestException);
    expect(() => pipe.transform('3.14')).toThrow(BadRequestException);
  });

  it('NormalizeStringPipe: trimt string', () => {
    const pipe = new NormalizeStringPipe();

    expect(pipe.transform('  hallo  ')).toBe('hallo');
  });

  it('NormalizeStringPipe: trimt en lowercased wanneer toLowerCase:true', () => {
    const pipe = new NormalizeStringPipe({ toLowerCase: true });

    expect(pipe.transform('  HeLLo@Example.COM  ')).toBe('hello@example.com');
  });

  it('NormalizeStringPipe: laat non-string values met rust', () => {
    const pipe = new NormalizeStringPipe({ toLowerCase: true });

    expect(pipe.transform(123)).toBe(123);
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
    expect(pipe.transform({ a: 1 })).toEqual({ a: 1 });
  });
});