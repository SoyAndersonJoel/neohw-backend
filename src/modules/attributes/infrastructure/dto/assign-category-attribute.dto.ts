import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignCategoryAttributeDto {
  @IsNotEmpty({ message: 'El attributeId es obligatorio.' })
  @IsUUID('4', { message: 'El attributeId debe ser un UUID válido.' })
  attributeId: string;
}
