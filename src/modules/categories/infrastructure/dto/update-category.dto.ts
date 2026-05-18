import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El parentId debe ser un UUID válido.' })
  parentId?: string | null;
}
