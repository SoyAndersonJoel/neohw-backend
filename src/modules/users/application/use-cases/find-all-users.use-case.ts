import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(page, limit);
  }
}
