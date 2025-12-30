import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MachineStatus } from '../enums/machine-status.enum';
import { Size } from '../../product-specs/enums/size.enum';

@Entity('machines')
export class Machine {
  @ApiProperty({
    description: 'ID único de la máquina (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Código único de la máquina',
    example: 'MAQ-001',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @ApiProperty({
    description: 'Nombre de la máquina',
    example: 'Máquina Tejedora Principal',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @ApiProperty({
    description: 'Número de agujas de la máquina (valor fijo)',
    example: 200,
    minimum: 1,
  })
  @Column({ type: 'int' })
  needleCount!: number;

  @ApiProperty({
    description: 'Cantidad de colores que puede trabajar la máquina',
    example: 4,
    minimum: 1,
    maximum: 15,
  })
  @Column({ type: 'int' })
  colorCount!: number;

  @ApiProperty({
    description:
      'Horas de trabajo acumuladas (se actualiza con las órdenes ejecutadas)',
    example: 125.5,
    minimum: 0,
    default: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  workingHours!: number;

  @ApiProperty({
    description: 'Estado actual de la máquina',
    enum: MachineStatus,
    example: MachineStatus.OPERATIVE,
  })
  @Column({
    type: 'enum',
    enum: MachineStatus,
    default: MachineStatus.OPERATIVE,
  })
  status!: MachineStatus;

  @ApiProperty({
    description: 'Tallas que puede realizar la máquina (1-3 tallas)',
    enum: Size,
    isArray: true,
    example: [Size.SIZE_2_4, Size.SIZE_4_6],
  })
  @Column({
    type: 'simple-array',
  })
  sizes!: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la máquina',
    example: 'Máquina con mantenimiento programado cada 6 meses',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T10:00:00Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-01T11:30:00Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
