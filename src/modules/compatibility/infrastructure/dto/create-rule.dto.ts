import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CompatibilityRuleType } from '../../domain/entities/compatibility-rule.entity';

export class CreateRuleDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(1000)
  description?: string;

  @IsNotEmpty({ message: 'El sourceAttributeId es obligatorio.' })
  @IsUUID('4', { message: 'El sourceAttributeId debe ser un UUID válido.' })
  sourceAttributeId: string;

  @IsNotEmpty({ message: 'El targetAttributeId es obligatorio.' })
  @IsUUID('4', { message: 'El targetAttributeId debe ser un UUID válido.' })
  targetAttributeId: string;

  @IsNotEmpty({ message: 'El ruleType es obligatorio.' })
  @IsEnum(CompatibilityRuleType, { message: 'Tipo de regla inválido.' })
  ruleType: CompatibilityRuleType;

  @IsNotEmpty({ message: 'La condición es obligatoria.' })
  @IsObject({ message: 'La condición debe ser un objeto.' })
  condition: Record<string, any>;
}
