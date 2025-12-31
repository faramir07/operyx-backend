import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCartonDto {
  @ApiProperty({
    description: 'Código único del cartón',
    example: 'CART-001',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiProperty({
    description: 'Nombre del cartón',
    example: 'Cartón Publicitario Mediano',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Características y dimensiones del cartón',
    example: '20x15x5 cm, para 6 pares de medias',
  })
  @IsString()
  @IsOptional()
  characteristics?: string;

  @ApiPropertyOptional({
    description: 'Stock mínimo requerido para alertas',
    example: 100.0,
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
    example: 2.5,
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
