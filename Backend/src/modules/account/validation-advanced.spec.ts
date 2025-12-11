import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { describe, expect, it } from 'vitest';

/**
 * Nested DTO’s voor whitelist / forbidNonWhitelisted demo
 */
class AddressDto {
  @IsString()
  street: string;
}

class UserWithAddressDto {
  @IsInt()
  id: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

/**
 * Custom validator demo
 */
@ValidatorConstraint({ async: false })
class IsFortyTwoConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    return value === 42;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'value must be exactly 42';
  }
}

function IsFortyTwo(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFortyTwoConstraint,
    });
  };
}

class CustomDecoratorDto {
  @IsFortyTwo()
  specialNumber: number;
}

/**
 * Validation groups demo
 */
class GroupedDto {
  @IsString({ groups: ['create'] })
  name: string;

  @IsOptional({ groups: ['update'] })
  @IsString({ groups: ['update'] })
  nickname?: string;
}

/**
 * Security-ish: __proto__ veld
 */
class ProtoTestDto {
  @IsString()
  name: string;
}

describe('Advanced ValidationPipe behaviour / hardening', () => {
  it('whitelist + forbidNonWhitelisted werkt ook in nested DTOs', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    const payload = {
      id: 1,
      address: {
        street: 'Main street',
        extra: 'hacker', // <-- deze mag niet
      },
    };

    await expect(
      pipe.transform(payload, {
        type: 'body',
        metatype: UserWithAddressDto,
        data: '',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validateCustomDecorators:true laat custom validators meedraaien', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      validateCustomDecorators: true,
    });

    // fout, want 41 != 42
    await expect(
      pipe.transform(
        { specialNumber: 41 },
        { type: 'body', metatype: CustomDecoratorDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    // goed, want 42
    const ok = await pipe.transform(
      { specialNumber: 42 },
      { type: 'body', metatype: CustomDecoratorDto, data: '' },
    );

    expect(ok.specialNumber).toBe(42);
  });

  it('validation groups: create vs update', async () => {
    const createPipe = new ValidationPipe({
      transform: true,
      groups: ['create'],
    });

    const updatePipe = new ValidationPipe({
      transform: true,
      groups: ['update'],
    });

    // CREATE: name is verplicht
    await expect(
      createPipe.transform(
        {},
        { type: 'body', metatype: GroupedDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    // UPDATE: nickname optioneel & valide
    const okUpdate = await updatePipe.transform(
      { nickname: 'johnny' },
      { type: 'body', metatype: GroupedDto, data: '' },
    );

    expect(okUpdate.nickname).toBe('johnny');
  });

  it('__proto__ veld kan niet zomaar een DTO “vergiftigen”', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    const payload: any = {
      name: 'safe',
      __proto__: { hacked: true },
    };

    const result = await pipe.transform(payload, {
      type: 'body',
      metatype: ProtoTestDto,
      data: '',
    });

    // result is een nette ProtoTestDto met alleen name
    expect(result).toBeInstanceOf(ProtoTestDto);
    expect(result.name).toBe('safe');

    // geen 'hacked' op het object zelf
    expect(result.hacked).toBeUndefined();

    // en de payload zelf heeft geen eigen property 'hacked'
    expect(Object.prototype.hasOwnProperty.call(payload, 'hacked')).toBe(false);
  });
});