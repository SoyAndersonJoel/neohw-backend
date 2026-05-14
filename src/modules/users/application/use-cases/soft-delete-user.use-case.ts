import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';
import { UsersError } from '../errors/users.error';

export type SoftDeleteUserInput = {
  targetUserId: string;
  requesterId: string;
  requesterRole: string;
};

export class SoftDeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SoftDeleteUserInput): Promise<User> {
    const targetUser = await this.userRepository.findById(input.targetUserId);
    if (!targetUser) {
      throw new UsersError('USER_NOT_FOUND');
    }

    // Solo ADMIN y SUPER_ADMIN pueden hacer borrado lógico
    if (input.requesterRole !== 'ADMIN' && input.requesterRole !== 'SUPER_ADMIN') {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    // Un usuario no se puede borrar a sí mismo (para evitar que admins se bloqueen)
    if (input.targetUserId === input.requesterId) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS', 'No puedes borrar tu propia cuenta');
    }

    // REGLA: Los roles ADMIN y SUPER_ADMIN NO pueden ser borrados lógicamente
    if (targetUser.role === 'ADMIN' || targetUser.role === 'SUPER_ADMIN') {
      throw new UsersError('INSUFFICIENT_PERMISSIONS', 'No se puede hacer borrado lógico a un Administrador');
    }

    return this.userRepository.softDelete(input.targetUserId);
  }
}
