import { IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AttributeValueItem {
  @IsNotEmpty({ message: 'El attributeId es obligatorio.' })
  @IsUUID('4', { message: 'El attributeId debe ser un UUID válido.' })
  attributeId: string;

  @IsNotEmpty({ message: 'El valor es obligatorio.' })
  @IsString({ message: 'El valor debe ser texto.' })
  value: string;
}

export class SetProductAttributesDto {
  @IsArray({ message: 'Los atributos deben ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => AttributeValueItem)
  attributes: AttributeValueItem[];
}
