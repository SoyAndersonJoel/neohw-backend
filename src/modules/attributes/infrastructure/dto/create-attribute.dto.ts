import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AttributeDataType } from '../../domain/entities/attribute.entity';

const AttributeDataTypeValues = {
  TEXT: 'TEXT' as const,
  NUMBER: 'NUMBER' as const,
  BOOLEAN: 'BOOLEAN' as const,
  SELECT: 'SELECT' as const,
  MULTI_SELECT: 'MULTI_SELECT' as const,
};

export class CreateAttributeDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEnum(AttributeDataType, { message: 'Tipo de dato inválido.' })
  dataType?: AttributeDataType;

  @IsOptional()
  @IsString({ message: 'La unidad debe ser texto.' })
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsBoolean({ message: 'isFilterable debe ser booleano.' })
  isFilterable?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isRequired debe ser booleano.' })
  isRequired?: boolean;

  @IsOptional()
  @IsArray({ message: 'Las opciones deben ser un array.' })
  @IsString({ each: true, message: 'Cada opción debe ser texto.' })
  options?: string[];
}
