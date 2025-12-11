import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, validate } from 'class-validator';

class UpdateAccount1 {
  @IsOptional()
  @IsInt()
  webwinkelId?: number;
}

describe('UpdateAccount1: undefined behaviour in DTO / transformed object', () => {
  it('moet een bestaande property correct converteren', () => {
    const dto = plainToInstance(UpdateAccount1, { webwinkelId: 123 });

    expect('webwinkelId' in dto).toEqual(true);
    expect(dto.webwinkelId).toEqual(123);
  });

  it('bij een afwezige property staat de key met waarde undefined in het getransformeerde object', () => {
    const dto = plainToInstance(UpdateAccount1, {});
    const plain = instanceToPlain(dto);

    expect('webwinkelId' in plain).toEqual(true);
    expect(Object.prototype.hasOwnProperty.call(plain, 'webwinkelId')).toEqual(
      true,
    );
    expect(plain.webwinkelId).toBeUndefined();
  });

  it('met exposeUnsetFields:false wordt de key NIET toegevoegd als de property ontbreekt', () => {
    const dto = plainToInstance(UpdateAccount1, {});
    const plain = instanceToPlain(dto, {
      exposeUnsetFields: false,
    });

    expect('webwinkelId' in plain).toEqual(false);
    expect(Object.prototype.hasOwnProperty.call(plain, 'webwinkelId')).toEqual(
      false,
    );
  });

  it('class-validator werkt nog gewoon als de property gezet is', async () => {
    const dto = new UpdateAccount1();
    dto.webwinkelId = 123;

    const result = await validate(dto);

    expect(result).toEqual([]); // geen validation errors
  });
});