import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '../enums/movement-type.enum';

export class CartonMovementDto {
  @ApiProperty({
    description: 'Cantidad en unidades',
    example: 100.0,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.PURCHASE,
  })
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiPropertyOptional({
    description: 'Motivo o descripción del movimiento',
    example: 'Compra de materiales',
  })
  @IsOptional()
  reason?: string;
}
