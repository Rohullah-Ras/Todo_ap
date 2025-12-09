import { plainToInstance, Type } from 'class-transformer';
import { IsInt, IsOptional, validate } from 'class-validator';

class UpdateAccount1 {
  @IsOptional()
  @IsInt()
  webwinkelId?: number;
}

describe('Validation: Partial<Dto> vs ? + @IsOptional', () => {
  it('moet een bestaande property correct converteren', () => {
    const validatedDto = plainToInstance(UpdateAccount1, {
      webwinkelId: 123,
    });
    expect('webwinkelId' in validatedDto).toEqual(true);
    expect(validatedDto.webwinkelId).toEqual(123);
  });

  it('moet voor een afwezige property de key op undefined zetten', () => {
    const validatedDto = plainToInstance(UpdateAccount1, {});
    expect('webwinkelId' in validatedDto).toEqual(true);
    expect(validatedDto.webwinkelId).toBeUndefined();
  });

  it('moet werken met class validator', async () => {
    const updateDto = new UpdateAccount1();
    updateDto.webwinkelId = 123;
    const result = await validate(updateDto);
    expect(result).toEqual([]);
  });
});
