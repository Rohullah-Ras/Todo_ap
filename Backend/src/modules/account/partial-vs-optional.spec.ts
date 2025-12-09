import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountModule } from './account.module';

describe('Validation: Partial<Dto> vs ? + @IsOptional', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AccountModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('(Partial<UpdateAccount1>) struct1 allows extra props and does not strip them or validate them', async () => {
    const res = await request(app.getHttpServer())
      .post('/test-accounts/struct1')
      .send({
        webwinkelId: 123,
        extra: 'not allowed',
      })
      .expect(201);

    // Because the param type is Partial<UpdateAccount1>,
    // Nest reflects it as plain Object -> whitelist cannot apply.
    // So both properties survive.
    expect(res.body.webwinkelId).toBe(123);
    expect(res.body.extra).toBe('not allowed');
  });

  it('struct2 (UpdateAccount2) keeps webwinkelId but strips non-whitelisted extra prop', async () => {
    const res = await request(app.getHttpServer())
      .post('/test-accounts/struct2')
      .send({
        webwinkelId: 123,
        extra: 'not allowed',
      })
      .expect(201);

    expect(res.body.webwinkelId).toBe(123);
    expect(res.body.extra).toBeUndefined();
  });

  it('struct1 accepts empty object and returns {}', async () => {
    const res = await request(app.getHttpServer())
      .post('/test-accounts/struct1')
      .send({})
      .expect(201);

    expect(res.body).toEqual({});
  });

  it('struct2 accepts empty object (because @IsOptional) and returns {}', async () => {
    const res = await request(app.getHttpServer())
      .post('/test-accounts/struct2')
      .send({})
      .expect(201);

    expect(res.body).toEqual({});
  });

  it('struct1 does NOT validate type (no decorators) and just echoes value', async () => {
    const res = await request(app.getHttpServer())
      .post('/test-accounts/struct1')
      .send({
        webwinkelId: 'abc',
      })
      .expect(201);

    // no transformation, no validation, string stays string
    expect(res.body).toEqual({ webwinkelId: 'abc' });
  });

  it('struct2 validates and rejects wrong type for webwinkelId', async () => {
    const res = await request(app.getHttpServer())
      .post('/test-accounts/struct2')
      .send({
        webwinkelId: 'abc',
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});

/** Partial<UpdateAccount1> in the controller param
 Nest sees the param type as Object, not the DTO class.
 ValidationPipe can’t really do its job:
 extra props (like extra) are not stripped
 wrong types ("abc") are not validated
 Only thing that works is: the JSON body is passed through as-is.



 UpdateAccount2 with ? + @IsOptional() + validators
 Nest sees the real class as metatype.
 whitelist: true strips unknown props.
 @IsInt() + @Type(() => Number) validate and transform types.
  Missing webwinkelId is okay thanks to @IsOptional().


  Niet-gewhiteliste props meegeven?
  Struct1 (Partial<UpdateAccount1>): ja, ze komen gewoon door.
  Struct2 (UpdateAccount2): nee, ze worden gestript (of 400 met forbidNonWhitelisted:true).

  Ontbrekende props / leeg object?
  Beide accepteren {} in je huidige setup.
  Struct2 doet dat expliciet via @IsOptional().

  Aanbeveling voor standaard structuur
  Gebruik altijd een DTO class met ? + @IsOptional() en validators in de controller, bijvoorbeeld:

  export class UpdateAccountDto {
 @IsOptional()
 @Type(() => Number)
 @IsInt()
  webwinkelId?: number | null;
  }

 @Patch()
  update(@Body(new ValidationPipe()) dto: UpdateAccountDto) { ... }


  En als je een “update” versie van een bestaande DTO wilt:
  class UpdateAccountDto extends PartialType(CreateAccountDto) {}
  maar gebruik dan nog steeds UpdateAccountDto als type, niet Partial<CreateAccountDto>

 **/