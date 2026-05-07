import { User } from '../../domain/entities/user.entity';
import {
  CreateUserParams,
  UserRepository,
} from '../../domain/interfaces/user.repository';
import { UsersError } from '../errors/users.error';

export type CreateUserInput = CreateUserParams;

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = this.normalizeEmail(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new UsersError('EMAIL_IN_USE');
    }

    return this.userRepository.create({
      email,
      passwordHash: input.passwordHash,
      role: input.role,
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
