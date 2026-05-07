import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    return this.userRepository.findByEmail(normalized);
  }
}
