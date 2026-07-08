import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordOtpDto {
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido.' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'El código OTP debe tener exactamente 6 caracteres.' })
  @IsNotEmpty({ message: 'El código OTP es requerido.' })
  code: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72, { message: 'La nueva contraseña no puede exceder los 72 caracteres.' })
  @Matches(/^(?=.*[A-Z])(?=(.*\d){2})(?=(.*[\W_]){2}).*$/, {
    message: 'La nueva contraseña debe contener al menos 1 mayúscula, 2 números y 2 caracteres especiales.',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida.' })
  newPassword: string;
}
