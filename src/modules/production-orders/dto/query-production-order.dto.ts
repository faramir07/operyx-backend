import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { Priority } from '../enums/priority.enum';

export class QueryProductionOrderDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de la orden',
    enum: OrderStatus,
    example: OrderStatus.QUEUED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la máquina',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la ficha técnica',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  productSpecId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por prioridad',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
    description:
      'Término de búsqueda general (código de ficha técnica, código de máquina)',
    example: 'FT-001',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
