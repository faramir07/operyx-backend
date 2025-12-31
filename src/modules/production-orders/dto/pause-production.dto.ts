import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PauseProductionDto {
  @ApiPropertyOptional({
    description: 'Razón o motivo de la pausa',
    example: 'Pausa por cambio de turno',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
