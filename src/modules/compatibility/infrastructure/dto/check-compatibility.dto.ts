import { IsArray, IsNotEmpty, IsUUID, ArrayMinSize } from 'class-validator';

export class CheckCompatibilityDto {
  @IsArray({ message: 'productIds debe ser un array.' })
  @ArrayMinSize(2, { message: 'Se requieren al menos 2 productos.' })
  @IsUUID('4', { each: true, message: 'Cada productId debe ser un UUID válido.' })
  productIds: string[];
}
