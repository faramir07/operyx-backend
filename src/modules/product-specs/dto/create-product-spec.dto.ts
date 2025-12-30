import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Size } from '../enums/size.enum';

export class CreateProductSpecDto {
  @ApiProperty({
    description: 'Código único de la ficha técnica',
    example: 'FT-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'Nombre del archivo de la ficha técnica',
    example: 'ficha-media-deportiva.pdf',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({
    description: 'Talla de la media',
    enum: Size,
    example: Size.SIZE_10_12,
  })
  @IsEnum(Size)
  size!: Size;

  @ApiPropertyOptional({
    description: 'ID del hilo elástico utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  elasticThreadId?: string;

  @ApiPropertyOptional({
    description: 'ID del hilo lycra utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  lycraThreadId?: string;

  @ApiPropertyOptional({
    description:
      'ID del hilo base principal utilizado (nyllon, exportex, etc.)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  baseThreadId?: string;

  @ApiProperty({
    description: 'Densidad 1,2: Inicio/Transferencia (10-50)',
    example: 15,
    minimum: 10,
    maximum: 50,
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @Type(() => Number)
  density1_2!: number;

  @ApiProperty({
    description: 'Densidad 3: Puño/Transferencia y pierna con elástico (10-50)',
    example: 20,
    minimum: 10,
    maximum: 50,
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @Type(() => Number)
  density3!: number;

  @ApiProperty({
    description: 'Densidad 4: Pierna lisa/Pie (10-50)',
    example: 18,
    minimum: 10,
    maximum: 50,
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @Type(() => Number)
  density4!: number;

  @ApiProperty({
    description: 'Densidad 5: Talón y puntera/Prepuntera (10-50)',
    example: 22,
    minimum: 10,
    maximum: 50,
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @Type(() => Number)
  density5!: number;

  @ApiProperty({
    description: 'Densidad 6: Guía (para cerrar) (10-50)',
    example: 16,
    minimum: 10,
    maximum: 50,
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @Type(() => Number)
  density6!: number;

  @ApiProperty({
    description: 'Densidad 7: Desperdicio (10-50)',
    example: 12,
    minimum: 10,
    maximum: 50,
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @Type(() => Number)
  density7!: number;

  @ApiProperty({
    description:
      'Tiempo estimado de elaboración en segundos (ej: 140 = 2:20 minutos)',
    example: 140,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  estimatedTime!: number;

  @ApiProperty({
    description: 'Peso del par de medias terminado en kilogramos',
    example: 0.025,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  weight!: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la ficha técnica',
    example: 'Media deportiva con refuerzo en talón y puntera',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
