import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
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

describe('ValidationPipe options – behaviour check', () => {
  it('whitelist strips fields zonder decorators', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
    });

    const result = await pipe.transform(
      { id: 1, name: 'John', extra: 'hacker' },
      { type: 'body', metatype: AccountDto, data: '' },
    );

    expect(result.id).toBe(1);
    expect(result.name).toBe('John');
    // extra is weg gefilterd
    expect(result.extra).toBeUndefined();
  });

  it('forbidNonWhitelisted: true gooit fout bij onbekende props', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    await expect(
      pipe.transform(
        { id: 1, name: 'John', extra: 'hacker' },
        { type: 'body', metatype: AccountDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forbidUnknownValues: true weigert rare waarden (null/{} zonder metatype)', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    });

    // zonder metatype: "unknown value"
    await expect(
      pipe.transform(null, { type: 'body', metatype: null as any, data: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('transform + enableImplicitConversion: "1" -> 1', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });

    const result = await pipe.transform(
      { id: '1', name: 'John' },
      { type: 'body', metatype: AccountDto, data: '' },
    );

    expect(result.id).toBe(1);
    expect(typeof result.id).toBe('number');
  });

  it('exposeUnsetFields:false: optionele props die niet zijn meegestuurd krijgen geen key', async () => {
    const pipe = new ValidationPipe({
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

    // key bestaat NIET
    expect(Object.prototype.hasOwnProperty.call(result, 'webwinkelId')).toBe(
      false,
    );
    expect(result.webwinkelId).toBeUndefined();
  });

  it('skipMissingProperties:true: mist verplichte property maar geeft geen fout', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      skipMissingProperties: true,
    });

    // name is verplicht in AccountDto, maar hier wordt het genegeerd
    const result = await pipe.transform(
      { id: 1 },
      { type: 'body', metatype: AccountDto, data: '' },
    );

    // id komt door, name wordt niet gevalideerd
    expect(result.id).toBe(1);
    expect(result.name).toBeUndefined();
  });

  it('zonder skipMissingProperties: mist verplichte property -> fout', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      skipMissingProperties: false,
    });

    await expect(
      pipe.transform(
        { id: 1 },
        { type: 'body', metatype: AccountDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stopAtFirstError:false geeft alle errors terug', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      stopAtFirstError: false,
    });

    await expect(
      pipe.transform(
        { id: 'not-int', name: 'x' }, // 2 fouten: id geen int, name te kort
        { type: 'body', metatype: AccountDto, data: '' },
      ),
    ).rejects.toMatchObject({
      response: {
        message: expect.arrayContaining([
          expect.stringContaining('id must be an integer'),
          expect.stringContaining(
            'name must be longer than or equal to 3 characters',
          ),
        ]),
      },
    });
  });
});