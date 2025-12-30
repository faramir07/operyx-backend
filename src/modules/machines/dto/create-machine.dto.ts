import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MachineStatus } from '../enums/machine-status.enum';
import { Size } from '../../product-specs/enums/size.enum';

export class CreateMachineDto {
  @ApiProperty({
    description: 'Código único de la máquina',
    example: 'MAQ-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'Nombre de la máquina',
    example: 'Máquina Tejedora Principal',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Número de agujas de la máquina (valor fijo)',
    example: 200,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  needleCount!: number;

  @ApiProperty({
    description: 'Cantidad de colores que puede trabajar la máquina',
    example: 4,
    minimum: 1,
    maximum: 15,
  })
  @IsInt()
  @Min(1)
  @Max(15)
  @Type(() => Number)
  colorCount!: number;

  @ApiPropertyOptional({
    description: 'Horas de trabajo acumuladas (por defecto 0)',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  workingHours?: number;

  @ApiPropertyOptional({
    description: 'Estado actual de la máquina',
    enum: MachineStatus,
    example: MachineStatus.OPERATIVE,
    default: MachineStatus.OPERATIVE,
  })
  @IsEnum(MachineStatus)
  @IsOptional()
  status?: MachineStatus;

  @ApiProperty({
    description: 'Tallas que puede realizar la máquina (1-3 tallas)',
    enum: Size,
    isArray: true,
    example: [Size.SIZE_2_4, Size.SIZE_4_6],
    minItems: 1,
    maxItems: 3,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum(Size, { each: true })
  sizes!: Size[];

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la máquina',
    example: 'Máquina con mantenimiento programado cada 6 meses',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
