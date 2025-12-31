import { IsNumber, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartialWeightDto {
  @ApiProperty({
    description: 'Peso parcial registrado en kilogramos',
    example: 1.25,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  weight!: number;

  @ApiPropertyOptional({
    description: 'Conteo parcial de medias en este registro',
    example: 50,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  count?: number;

  @ApiPropertyOptional({
    description: 'Notas sobre este peso parcial',
    example: 'Peso después de primera hora de producción',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
