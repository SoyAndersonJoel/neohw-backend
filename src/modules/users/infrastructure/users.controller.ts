import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Role } from '../domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UsersErrorInterceptor } from './users-error.interceptor';
import { CHANGE_USER_ROLE_USE_CASE } from '../users.tokens';
import { ChangeUserRoleUseCase } from '../application/use-cases/change-user-role.use-case';
import type { AccessRequestUser } from '../../auth/infrastructure/types/auth-request-user';

@Controller('users')
@UseInterceptors(UsersErrorInterceptor)
export class UsersController {
  constructor(
    @Inject(CHANGE_USER_ROLE_USE_CASE)
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
  ) {}

  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async changeRole(
    @Param('id') targetUserId: string,
    @Body() dto: ChangeRoleDto,
    @Req() req: Request & { user: AccessRequestUser },
  ): Promise<{ message: string; user: { id: string; email: string; role: Role } }> {
    const updatedUser = await this.changeUserRoleUseCase.execute({
      targetUserId,
      newRole: dto.role,
      requesterId: req.user.id,
      requesterRole: req.user.role,
    });

    return {
      message: 'Rol actualizado exitosamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }
}
