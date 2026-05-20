import { IsEnum, IsNotEmpty } from 'class-validator';

// Como no podemos importar el enum directamente del PrismaClient en el decorador (a veces da problemas),
// definimos los valores válidos manualmente.
export enum AllowedOrderStatus {
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(AllowedOrderStatus, {
    message: 'El estado debe ser PROCESSING, SHIPPED, DELIVERED o CANCELLED',
  })
  status: keyof typeof AllowedOrderStatus;
}
