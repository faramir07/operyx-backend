import {
  IsOptional,
  IsString,
  IsInt,
  IsUUID,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Size } from '../enums/size.enum';

export class QueryProductSpecDto {
  @ApiPropertyOptional({
    description: 'Filtrar por código de ficha técnica',
    example: 'FT-001',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de archivo',
    example: 'ficha-media-deportiva.pdf',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por talla de la media',
    enum: Size,
    example: Size.SIZE_10_12,
  })
  @IsOptional()
  @IsEnum(Size)
  size?: Size;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del hilo elástico utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  elasticThreadId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del hilo lycra utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  lycraThreadId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del hilo base principal utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  baseThreadId?: string;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda general (código, nombre de archivo)',
    example: 'deportiva',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
