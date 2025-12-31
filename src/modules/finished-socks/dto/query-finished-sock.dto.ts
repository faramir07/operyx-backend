import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Size } from '../../product-specs/enums/size.enum';

export class QueryFinishedSockDto {
  @ApiPropertyOptional({
    description: 'ID de la ficha técnica para filtrar',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  productSpecId?: string;

  @ApiPropertyOptional({
    description: 'Talla para filtrar',
    enum: Size,
    example: Size.SIZE_10_12,
  })
  @IsEnum(Size)
  @IsOptional()
  size?: Size;

  @ApiPropertyOptional({
    description:
      'Búsqueda general por código o nombre de ficha técnica (se busca en la relación ProductSpec)',
    example: 'FT-001',
    maxLength: 100,
  })
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
