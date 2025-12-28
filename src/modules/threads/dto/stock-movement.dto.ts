import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

export class StockMovementDto {
  @ApiProperty({
    description: 'Cantidad de stock a mover',
    example: 50.5,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    description: 'Tipo de movimiento: entrada (entry) o salida (exit)',
    enum: MovementType,
    example: MovementType.ENTRY,
  })
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiPropertyOptional({
    description: 'Motivo o descripción del movimiento',
    example: 'Compra de materiales',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
