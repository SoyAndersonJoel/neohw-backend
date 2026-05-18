import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El parentId debe ser un UUID válido.' })
  parentId?: string;
}
