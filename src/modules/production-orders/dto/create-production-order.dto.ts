import {
  IsUUID,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '../enums/priority.enum';

export class CreateProductionOrderDto {
  @ApiProperty({
    description: 'ID de la ficha técnica asociada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  productSpecId!: string;

  @ApiProperty({
    description: 'ID de la máquina asignada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  machineId!: string;

  @ApiProperty({
    description: 'Cantidad de pares de medias a producir',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Prioridad de la orden',
    enum: Priority,
    example: Priority.MEDIUM,
    default: Priority.MEDIUM,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la orden',
    example: 'Orden urgente para cliente importante',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
