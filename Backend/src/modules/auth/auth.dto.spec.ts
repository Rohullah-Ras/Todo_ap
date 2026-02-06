import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

describe('Auth & Account DTO validation', () => {
  it('LoginDto accepts valid input', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'user@example.com',
      password: 'secret123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('LoginDto rejects invalid input', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'not-an-email',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('RegisterDto accepts valid input', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'new@example.com',
      password: 'secret123',
      fullName: 'Test User',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('RegisterDto rejects invalid input', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'bad-email',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('UpdateAccountDto accepts partial input', async () => {
    const dto = Object.assign(new UpdateAccountDto(), {
      fullName: 'New Name',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('UpdateAccountDto rejects invalid input', async () => {
    const dto = Object.assign(new UpdateAccountDto(), {
      email: 'bad',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
