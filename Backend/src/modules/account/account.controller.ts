import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UpdateAccount1, UpdateAccount2 } from './dto/update-account.dto';

@Controller('test-accounts')
export class AccountController {
  @Post('struct1')
  updateStruct1(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    )
    body: Partial<UpdateAccount1>,
  ) {
    return body;
  }

  @Post('struct2')
  updateStruct2(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    )
    body: UpdateAccount2,
  ) {
    return body;
  }
}