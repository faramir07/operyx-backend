import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BagType } from '../enums/bag-type.enum';
import { BagCapacity } from '../enums/bag-capacity.enum';

export class QueryBagDto {
  @ApiPropertyOptional({
    description: 'Filtrar por código de la bolsa',
    example: 'BOLSA-001',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de la bolsa',
    example: 'Bolsa Pequeña',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de bolsa',
    enum: BagType,
    example: BagType.SMALL,
  })
  @IsEnum(BagType)
  @IsOptional()
  type?: BagType;

  @ApiPropertyOptional({
    description: 'Filtrar por capacidad de la bolsa',
    enum: BagCapacity,
    example: BagCapacity.INDIVIDUAL,
  })
  @IsEnum(BagCapacity)
  @IsOptional()
  capacity?: BagCapacity;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del proveedor',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda general (código o nombre)',
    example: 'BOLSA',
    maxLength: 100,
  })
  @IsString()
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
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
