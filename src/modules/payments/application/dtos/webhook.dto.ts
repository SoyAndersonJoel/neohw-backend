import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  transactionId: string; // ID devuelto por el gateway (para idempotencia)

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
