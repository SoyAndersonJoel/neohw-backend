import { RegisterUseCase } from './register.use-case';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';
import { HashService } from '../../domain/interfaces/hash.service';
import { RequestOtpUseCase } from './request-otp.use-case';
import { Role } from '../../../users/domain/enums/role.enum';
import { OtpPurpose } from '../../../../generated/prisma/enums';
import { mock, mockClear } from 'jest-mock-extended';

describe('RegisterUseCase', () => {
  const createUserUseCase = mock<CreateUserUseCase>();
  const hashService = mock<HashService>();
  const requestOtpUseCase = mock<RequestOtpUseCase>();

  let useCase: RegisterUseCase;

  beforeEach(() => {
    mockClear(createUserUseCase);
    mockClear(hashService);
    mockClear(requestOtpUseCase);
    useCase = new RegisterUseCase(
      createUserUseCase,
      hashService,
      requestOtpUseCase,
    );
  });

  it('should hash password, create user and request OTP asynchronously', async () => {
    hashService.hash.mockResolvedValue('hashed-pwd');
    createUserUseCase.execute.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
    } as any);

    // Mock resolve for the fire-and-forget OTP request
    requestOtpUseCase.execute.mockResolvedValue();

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password',
    });

    expect(hashService.hash).toHaveBeenCalledWith('password');
    expect(createUserUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-pwd',
      role: Role.USER,
    });
    expect(requestOtpUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      purpose: OtpPurpose.ACCOUNT_VERIFICATION,
    });
    expect(result).toEqual({
      message: 'Registro exitoso. Por favor, revisa tu correo electrónico para verificar tu cuenta.',
    });
  });

  it('should not throw if requestOtpUseCase fails asynchronously', async () => {
    hashService.hash.mockResolvedValue('hashed-pwd');
    createUserUseCase.execute.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
    } as any);

    // Simulamos que el envío del OTP falla (el console.error está en el catch)
    requestOtpUseCase.execute.mockRejectedValue(new Error('OTP failed'));
    
    // Suprimir el console.error temporalmente para mantener limpios los logs de prueba
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).resolves.toBeDefined();

    consoleSpy.mockRestore();
  });
});
