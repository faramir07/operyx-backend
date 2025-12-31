import { IsUUID, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Size } from '../../product-specs/enums/size.enum';

export class CreateFinishedSockDto {
  @ApiProperty({
    description: 'ID de la ficha técnica asociada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  productSpecId!: string;

  @ApiProperty({
    description: 'Talla de la media',
    enum: Size,
    example: Size.SIZE_10_12,
  })
  @IsEnum(Size)
  size!: Size;

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
    description: 'Precio unitario por par',
    example: 5.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @ApiProperty({
    description: 'Precio por docena de pares',
    example: 65.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  dozenPrice!: number;
}
