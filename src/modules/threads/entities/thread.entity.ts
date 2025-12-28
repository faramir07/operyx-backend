import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('threads')
export class Thread {
  @ApiProperty({ description: 'ID único del hilo (UUID)', example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Código único del hilo', example: 'HILO-001' })
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @ApiProperty({ description: 'Tipo de hilo', example: 'Algodón' })
  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @ApiProperty({ description: 'Marca del hilo', example: 'Marca XYZ' })
  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @ApiProperty({ description: 'Calibre del hilo', example: '20/2' })
  @Column({ type: 'varchar', length: 50 })
  gauge!: string;

  @ApiProperty({ description: 'Color del hilo', example: 'Azul' })
  @Column({ type: 'varchar', length: 100 })
  color!: string;

  @ApiProperty({ description: 'Peso en kilogramos', example: 10.5 })
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  weight!: number;

  @ApiProperty({ description: 'Stock mínimo requerido', example: 50.0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStock!: number;

  @ApiProperty({ description: 'Precio unitario', example: 15.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({ description: 'Stock actual', example: 100.0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock!: number;

  @ApiPropertyOptional({
    description: 'Descripción adicional del hilo',
    example: 'Hilo de algodón premium',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
