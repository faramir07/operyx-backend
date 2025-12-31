import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartProductionDto {
  @ApiPropertyOptional({
    description:
      'Fecha y hora de inicio de la producción (por defecto: momento actual)',
    example: '2023-01-01T10:00:00Z',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;
}
