import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString({ message: 'La marca debe ser texto.' })
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString({ message: 'El modelo debe ser texto.' })
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsString({ message: 'El SKU debe ser texto.' })
  @MaxLength(50)
  sku?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El stock debe ser un número.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock?: number;

  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser texto.' })
  imageUrl?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El categoryId debe ser un UUID válido.' })
  categoryId?: string;
}
