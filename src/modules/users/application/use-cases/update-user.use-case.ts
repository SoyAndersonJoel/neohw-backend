import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';
import { UsersError } from '../errors/users.error';

export type UpdateUserInput = {
  targetUserId: string;
  requesterId: string;
  requesterRole: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const targetUser = await this.userRepository.findById(input.targetUserId);
    if (!targetUser) {
      throw new UsersError('USER_NOT_FOUND');
    }

    // Un usuario solo puede actualizarse a sí mismo, a menos que sea ADMIN o SUPER_ADMIN
    if (
      input.targetUserId !== input.requesterId &&
      input.requesterRole !== 'ADMIN' &&
      input.requesterRole !== 'SUPER_ADMIN'
    ) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    // No se puede actualizar a un SUPER_ADMIN a menos que seas el mismo SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' && input.requesterId !== input.targetUserId) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    return this.userRepository.update(input.targetUserId, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });
  }
}
