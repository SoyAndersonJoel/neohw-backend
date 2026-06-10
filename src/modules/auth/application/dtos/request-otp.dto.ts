import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { OtpPurpose } from '../../../../generated/prisma/enums';

export class RequestOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(OtpPurpose)
  @IsNotEmpty()
  purpose: OtpPurpose;
}
