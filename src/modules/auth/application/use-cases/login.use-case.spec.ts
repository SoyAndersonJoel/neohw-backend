import { LoginUseCase } from './login.use-case';
import { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case';
import { HashService } from '../../domain/interfaces/hash.service';
import { AuthTokenService } from '../auth-token.service';
import { AuthError } from '../errors/auth.error';
import { mock, mockClear } from 'jest-mock-extended';

describe('LoginUseCase', () => {
  const findUserByEmailUseCase = mock<FindUserByEmailUseCase>();
  const hashService = mock<HashService>();
  const authTokenService = mock<AuthTokenService>();

  let useCase: LoginUseCase;

  beforeEach(() => {
    mockClear(findUserByEmailUseCase);
    mockClear(hashService);
    mockClear(authTokenService);
    useCase = new LoginUseCase(
      findUserByEmailUseCase,
      hashService,
      authTokenService,
    );
  });

  it('should throw INVALID_CREDENTIALS if user is not found', async () => {
    findUserByEmailUseCase.execute.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(new AuthError('INVALID_CREDENTIALS'));
  });

  it('should throw USER_DISABLED if user is not active', async () => {
    findUserByEmailUseCase.execute.mockResolvedValue({ isActive: false } as any);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(new AuthError('USER_DISABLED'));
  });

  it('should throw UNVERIFIED_ACCOUNT if user is not verified', async () => {
    findUserByEmailUseCase.execute.mockResolvedValue({
      isActive: true,
      isVerified: false,
    } as any);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(new AuthError('UNVERIFIED_ACCOUNT'));
  });

  it('should throw INVALID_CREDENTIALS if user has no passwordHash (OAuth account)', async () => {
    findUserByEmailUseCase.execute.mockResolvedValue({
      isActive: true,
      isVerified: true,
      passwordHash: null,
    } as any);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(new AuthError('INVALID_CREDENTIALS'));
  });

  it('should throw INVALID_CREDENTIALS if password does not match', async () => {
    findUserByEmailUseCase.execute.mockResolvedValue({
      isActive: true,
      isVerified: true,
      passwordHash: 'hashed-pwd',
    } as any);
    hashService.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(new AuthError('INVALID_CREDENTIALS'));
  });

  it('should return auth tokens and public user when credentials are valid', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: true,
      isVerified: true,
      passwordHash: 'hashed-pwd',
      role: 'USER',
      firstName: 'John',
      lastName: 'Doe',
      phone: '123456789',
    };
    findUserByEmailUseCase.execute.mockResolvedValue(mockUser as any);
    hashService.verify.mockResolvedValue(true);
    authTokenService.issueTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual({
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
        isActive: true,
        isVerified: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(authTokenService.issueTokens).toHaveBeenCalledWith(mockUser);
  });
});
