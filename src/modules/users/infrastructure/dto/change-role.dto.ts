import { IsEnum } from 'class-validator';
import { Role } from '../../domain/enums/role.enum';

export class ChangeRoleDto {
  @IsEnum(Role, { message: 'El rol debe ser uno válido: USER, SELLER, ADMIN.' })
  role: Role;
}
