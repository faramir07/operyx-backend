import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Stock físico real del hilo después del conteo',
    example: 95.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  physicalStock!: number;
}
