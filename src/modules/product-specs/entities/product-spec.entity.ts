import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Thread } from '../../threads/entities/thread.entity';
import { Size } from '../enums/size.enum';

@Entity('product_specs')
export class ProductSpec {
  @ApiProperty({
    description: 'ID único de la ficha técnica (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Código único de la ficha técnica',
    example: 'FT-001',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @ApiProperty({
    description: 'Nombre del archivo de la ficha técnica',
    example: 'ficha-media-deportiva.pdf',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @ApiProperty({
    description: 'Talla de la media',
    enum: Size,
    example: Size.SIZE_10_12,
  })
  @Column({
    type: 'enum',
    enum: Size,
  })
  size!: Size;

  @ApiPropertyOptional({
    description: 'ID del hilo elástico utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid', nullable: true })
  elasticThreadId?: string;

  @ApiPropertyOptional({
    description: 'Hilo elástico utilizado en la ficha técnica',
    type: () => Thread,
  })
  @ManyToOne(() => Thread, { nullable: true, eager: false })
  @JoinColumn({ name: 'elasticThreadId' })
  elasticThread?: Thread;

  @ApiPropertyOptional({
    description: 'ID del hilo lycra utilizado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid', nullable: true })
  lycraThreadId?: string;

  @ApiPropertyOptional({
    description: 'Hilo lycra utilizado en la ficha técnica',
    type: () => Thread,
  })
  @ManyToOne(() => Thread, { nullable: true, eager: false })
  @JoinColumn({ name: 'lycraThreadId' })
  lycraThread?: Thread;

  @ApiPropertyOptional({
    description:
      'ID del hilo base principal utilizado (nyllon, exportex, etc.)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid', nullable: true })
  baseThreadId?: string;

  @ApiPropertyOptional({
    description: 'Hilo base principal utilizado en la ficha técnica',
    type: () => Thread,
  })
  @ManyToOne(() => Thread, { nullable: true, eager: false })
  @JoinColumn({ name: 'baseThreadId' })
  baseThread?: Thread;

  @ApiProperty({
    description: 'Densidad 1,2: Inicio/Transferencia (10-50)',
    example: 15,
    minimum: 10,
    maximum: 50,
  })
  @Column({ type: 'int' })
  density1_2!: number;

  @ApiProperty({
    description: 'Densidad 3: Puño/Transferencia y pierna con elástico (10-50)',
    example: 20,
    minimum: 10,
    maximum: 50,
  })
  @Column({ type: 'int' })
  density3!: number;

  @ApiProperty({
    description: 'Densidad 4: Pierna lisa/Pie (10-50)',
    example: 18,
    minimum: 10,
    maximum: 50,
  })
  @Column({ type: 'int' })
  density4!: number;

  @ApiProperty({
    description: 'Densidad 5: Talón y puntera/Prepuntera (10-50)',
    example: 22,
    minimum: 10,
    maximum: 50,
  })
  @Column({ type: 'int' })
  density5!: number;

  @ApiProperty({
    description: 'Densidad 6: Guía (para cerrar) (10-50)',
    example: 16,
    minimum: 10,
    maximum: 50,
  })
  @Column({ type: 'int' })
  density6!: number;

  @ApiProperty({
    description: 'Densidad 7: Desperdicio (10-50)',
    example: 12,
    minimum: 10,
    maximum: 50,
  })
  @Column({ type: 'int' })
  density7!: number;

  @ApiProperty({
    description:
      'Tiempo estimado de elaboración en segundos (ej: 140 = 2:20 minutos)',
    example: 140,
    minimum: 0,
  })
  @Column({ type: 'int' })
  estimatedTime!: number;

  @ApiProperty({
    description: 'Peso del par de medias terminado en kilogramos',
    example: 0.025,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  weight!: number;

  @ApiPropertyOptional({
    description:
      'Porcentaje aproximado de hilo elástico utilizado (0-100). Los tres porcentajes deben sumar 100',
    example: 30.0,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  elasticThreadPercentage?: number;

  @ApiPropertyOptional({
    description:
      'Porcentaje aproximado de hilo lycra utilizado (0-100). Los tres porcentajes deben sumar 100',
    example: 20.0,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  lycraThreadPercentage?: number;

  @ApiPropertyOptional({
    description:
      'Porcentaje aproximado de hilo base utilizado (0-100). Los tres porcentajes deben sumar 100',
    example: 50.0,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  baseThreadPercentage?: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la ficha técnica',
    example: 'Media deportiva con refuerzo en talón y puntera',
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
