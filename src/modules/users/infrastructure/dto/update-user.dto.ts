import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto.' })
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(20)
  phone?: string;
}
