import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MachineStatus } from '../enums/machine-status.enum';
import { Size } from '../../product-specs/enums/size.enum';

export class QueryMachineDto {
  @ApiPropertyOptional({
    description: 'Filtrar por código de máquina',
    example: 'MAQ-001',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de máquina',
    example: 'Máquina Tejedora',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la máquina',
    enum: MachineStatus,
    example: MachineStatus.OPERATIVE,
  })
  @IsOptional()
  @IsEnum(MachineStatus)
  status?: MachineStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por número de agujas',
    example: 200,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  needleCount?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por cantidad de colores',
    example: 4,
    minimum: 1,
    maximum: 15,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  @Type(() => Number)
  colorCount?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tallas que puede realizar',
    enum: Size,
    isArray: true,
    example: [Size.SIZE_2_4],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Size, { each: true })
  sizes?: Size[];

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
    description: 'Término de búsqueda general (código, nombre)',
    example: 'tejedora',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
