import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Proveedor Textil S.A.',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Código único del proveedor',
    example: 'PROV-001',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Nombre de contacto del proveedor',
    example: 'Juan Pérez',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto',
    example: 'contacto@proveedor.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+57 300 123 4567',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección del proveedor',
    example: 'Calle 123 #45-67, Bogotá',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el proveedor',
    example: 'Proveedor preferencial para hilos de algodón',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Indica si el proveedor está activo',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
