import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { HookMovement } from './hook-movement.entity';

@Entity('hooks')
export class Hook {
  @ApiProperty({
    description: 'ID único del gancho (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Código único del gancho',
    example: 'GANCHO-001',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @ApiProperty({
    description: 'Nombre del gancho',
    example: 'Gancho Estándar',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @ApiProperty({
    description: 'Stock actual en unidades',
    example: 2000.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock!: number;

  @ApiProperty({
    description: 'Stock mínimo requerido para alertas',
    example: 500.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStock!: number;

  @ApiProperty({
    description: 'Precio de compra por unidad',
    example: 0.25,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice!: number;

  @ApiPropertyOptional({
    description: 'ID del proveedor asociado',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid', nullable: true })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Proveedor asociado al gancho',
    type: () => Supplier,
  })
  @ManyToOne(() => Supplier, { nullable: true, eager: false })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @ApiPropertyOptional({
    description: 'Registros de movimientos de stock',
    type: () => [HookMovement],
  })
  @OneToMany(() => HookMovement, (movement) => movement.hook, {
    cascade: false,
  })
  movements?: HookMovement[];

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
