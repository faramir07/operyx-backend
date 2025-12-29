import { IsOptional, IsString, IsInt, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryThreadDto {
  @ApiPropertyOptional({
    description: 'Filtrar por código de hilo',
    example: 'HILO-001',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de hilo',
    example: 'Algodón',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por marca de hilo',
    example: 'Marca XYZ',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por calibre de hilo',
    example: '20/2',
  })
  @IsOptional()
  @IsString()
  gauge?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por color de hilo',
    example: 'Azul',
  })
  @IsOptional()
  @IsString()
  color?: string;

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
    description: 'Término de búsqueda general (código, tipo, marca, color)',
    example: 'algodon azul',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del proveedor',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
