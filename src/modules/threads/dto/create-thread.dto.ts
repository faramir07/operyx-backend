import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({
    description: 'Código único del hilo',
    example: 'HILO-001',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiProperty({
    description: 'Tipo de hilo',
    example: 'Algodón',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type!: string;

  @ApiProperty({
    description: 'Marca del hilo',
    example: 'Marca XYZ',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  brand!: string;

  @ApiProperty({
    description: 'Calibre del hilo',
    example: '20/2',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  gauge!: string;

  @ApiProperty({
    description: 'Color del hilo',
    example: 'Azul',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  color!: string;

  @ApiProperty({
    description: 'Peso en kilogramos',
    example: 10.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Type(() => Number)
  weight!: number;

  @ApiProperty({
    description: 'Stock mínimo requerido',
    example: 50.0,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  minStock!: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 15.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({
    description: 'Stock actual (por defecto 0)',
    example: 100.0,
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  currentStock?: number;

  @ApiPropertyOptional({
    description: 'Descripción adicional del hilo',
    example: 'Hilo de algodón premium para medias deportivas',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
