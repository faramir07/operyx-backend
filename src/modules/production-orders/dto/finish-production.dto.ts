import { IsOptional, IsDate, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinishProductionDto {
  @ApiPropertyOptional({
    description:
      'Fecha y hora de finalización de la producción (por defecto: momento actual)',
    example: '2023-01-01T18:30:00Z',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Peso total final de la producción en kilogramos',
    example: 2.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  totalWeight!: number;

  @ApiProperty({
    description: 'Conteo final de pares de medias producidas',
    example: 98,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  finalCount!: number;
}
