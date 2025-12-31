import { IsNumber, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '../enums/movement-type.enum';

export class StockMovementDto {
  @ApiProperty({
    description: 'Cantidad en pares',
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
    example: MovementType.PRODUCTION,
  })
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiPropertyOptional({
    description: 'Motivo o descripción del movimiento',
    example: 'Entrada por producción completada',
  })
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description:
      'ID de la orden de producción asociada (solo para movimientos de tipo PRODUCTION)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  productionOrderId?: string;
}
