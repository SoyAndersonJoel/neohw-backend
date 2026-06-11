import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyAccountOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code: string;
}
