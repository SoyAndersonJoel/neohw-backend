import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../domain/enums/role.enum';

const ASSIGNABLE_ROLES = [Role.USER, Role.SELLER, Role.ADMIN] as const;

export class ChangeRoleDto {
  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  @IsIn(ASSIGNABLE_ROLES, {
    message: `El rol debe ser uno de: ${ASSIGNABLE_ROLES.join(', ')}`,
  })
  role: Role;
}
