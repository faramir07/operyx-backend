import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySupplierDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre del proveedor',
    example: 'Proveedor Textil',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por código del proveedor',
    example: 'PROV-001',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por email del proveedor',
    example: 'contacto@proveedor.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

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
    description: 'Término de búsqueda general (nombre, código, email)',
    example: 'textil',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
