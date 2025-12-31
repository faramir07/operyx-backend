import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BagType } from '../enums/bag-type.enum';
import { BagCapacity } from '../enums/bag-capacity.enum';

export class CreateBagDto {
  @ApiProperty({
    description: 'Código único de la bolsa',
    example: 'BOLSA-001',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiProperty({
    description: 'Nombre de la bolsa',
    example: 'Bolsa Pequeña Individual',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Tipo de bolsa',
    enum: BagType,
    example: BagType.SMALL,
  })
  @IsEnum(BagType)
  type!: BagType;

  @ApiProperty({
    description: 'Capacidad de la bolsa (cantidad de pares)',
    enum: BagCapacity,
    example: BagCapacity.INDIVIDUAL,
  })
  @IsEnum(BagCapacity)
  capacity!: BagCapacity;

  @ApiPropertyOptional({
    description: 'Stock mínimo requerido para alertas',
    example: 200.0,
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minStock?: number;

  @ApiProperty({
    description: 'Precio de compra por unidad',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  purchasePrice!: number;

  @ApiPropertyOptional({
    description: 'ID del proveedor asociado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  supplierId?: string;
}
