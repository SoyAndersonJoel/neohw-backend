import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Query,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersErrorInterceptor } from './users-error.interceptor';
import {
  CHANGE_USER_ROLE_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  UPDATE_USER_USE_CASE,
  SOFT_DELETE_USER_USE_CASE,
} from '../users.tokens';
import { ChangeUserRoleUseCase } from '../application/use-cases/change-user-role.use-case';
import { FindAllUsersUseCase } from '../application/use-cases/find-all-users.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { SoftDeleteUserUseCase } from '../application/use-cases/soft-delete-user.use-case';
import { FindUserByIdUseCase } from '../application/use-cases/find-user-by-id.use-case';
import type { AccessRequestUser } from '../../auth/infrastructure/types/auth-request-user';
import { toPublicUser } from '../../auth/application/auth-result';

@Controller('users')
@UseInterceptors(UsersErrorInterceptor)
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    @Inject(CHANGE_USER_ROLE_USE_CASE)
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
    @Inject(FIND_ALL_USERS_USE_CASE)
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    @Inject(UPDATE_USER_USE_CASE)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(SOFT_DELETE_USER_USE_CASE)
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
    const result = await this.findAllUsersUseCase.execute(pageNumber, limitNumber);
    return {
      users: result.users.map(toPublicUser),
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
    };
  }

  @Get('me')
  async getMyProfile(@Req() req: Request & { user: AccessRequestUser }) {
    const user = await this.findUserByIdUseCase.execute(req.user.id);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return { user: toPublicUser(user) };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async findById(@Param('id') id: string) {
    const user = await this.findUserByIdUseCase.execute(id);
    if (!user) {
      throw new Error('USER_NOT_FOUND'); // interceptor will map this
    }
    return { user: toPublicUser(user) };
  }

  @Patch(':id')
  async updateProfile(
    @Param('id') targetUserId: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    // Si manda "me", usamos su propio ID
    const actualTargetId = targetUserId === 'me' ? req.user.id : targetUserId;

    const updatedUser = await this.updateUserUseCase.execute({
      targetUserId: actualTargetId,
      requesterId: req.user.id,
      requesterRole: req.user.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    return {
      message: 'Perfil actualizado exitosamente',
      user: toPublicUser(updatedUser),
    };
  }

  @Delete(':id')
  async softDelete(
    @Param('id') targetUserId: string,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    const actualTargetId = targetUserId === 'me' ? req.user.id : targetUserId;

    const deletedUser = await this.softDeleteUserUseCase.execute({
      targetUserId: actualTargetId,
      requesterId: req.user.id,
      requesterRole: req.user.role,
    });

    return {
      message: 'Usuario desactivado exitosamente (borrado lógico)',
      user: toPublicUser(deletedUser),
    };
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async changeRole(
    @Param('id') targetUserId: string,
    @Body() dto: ChangeRoleDto,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    const updatedUser = await this.changeUserRoleUseCase.execute({
      targetUserId,
      newRole: dto.role,
      requesterId: req.user.id,
      requesterRole: req.user.role,
    });

    return {
      message: 'Rol actualizado exitosamente',
      user: toPublicUser(updatedUser),
    };
  }
}
