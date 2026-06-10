import { Role } from '../../domain/enums/role.enum';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';
import { UsersError } from '../errors/users.error';
import { NotificationsService } from '../../../notifications/application/services/notifications.service';

export type ChangeUserRoleInput = {
  targetUserId: string;
  newRole: Role;
  requesterId: string;
  requesterRole: Role;
};

export class ChangeUserRoleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(input: ChangeUserRoleInput): Promise<User> {
    // 1. No puedes cambiarte el rol a ti mismo
    if (input.targetUserId === input.requesterId) {
      throw new UsersError('CANNOT_CHANGE_OWN_ROLE');
    }

    // 2. SUPER_ADMIN solo se asigna vía seed de base de datos
    if (input.newRole === Role.SUPER_ADMIN) {
      throw new UsersError('CANNOT_ASSIGN_SUPER_ADMIN');
    }

    // 3. Solo SUPER_ADMIN puede asignar el rol ADMIN
    if (input.newRole === Role.ADMIN && input.requesterRole !== Role.SUPER_ADMIN) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    // 4. Solo ADMIN y SUPER_ADMIN pueden promover (guard ya valida, esto es defensa en profundidad)
    if (input.requesterRole !== Role.SUPER_ADMIN && input.requesterRole !== Role.ADMIN) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    // 5. Verificar que el usuario objetivo existe y está activo
    const targetUser = await this.userRepository.findById(input.targetUserId);
    if (!targetUser) {
      throw new UsersError('USER_NOT_FOUND');
    }
    if (!targetUser.isActive) {
      throw new UsersError('USER_DISABLED');
    }

    // 6. Nadie puede modificar a un SUPER_ADMIN
    if (targetUser.role === Role.SUPER_ADMIN) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    // 7. Solo SUPER_ADMIN puede modificar a otro ADMIN
    if (targetUser.role === Role.ADMIN && input.requesterRole !== Role.SUPER_ADMIN) {
      throw new UsersError('INSUFFICIENT_PERMISSIONS');
    }

    // 8. No reasignar el mismo rol
    if (targetUser.role === input.newRole) {
      return targetUser;
    }

    const updatedUser = await this.userRepository.updateRole(input.targetUserId, input.newRole);

    // Enviar correo asíncronamente
    this.notifications.sendRoleChangeEmail(updatedUser.email, updatedUser.firstName || 'Usuario', input.newRole).catch(err => {
      console.error('No se pudo enviar correo de cambio de rol:', err);
    });

    return updatedUser;
  }
}
