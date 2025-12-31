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
import { BagType } from '../enums/bag-type.enum';
import { BagCapacity } from '../enums/bag-capacity.enum';
import { BagMovement } from './bag-movement.entity';

@Entity('bags')
export class Bag {
  @ApiProperty({
    description: 'ID único de la bolsa (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Código único de la bolsa',
    example: 'BOLSA-001',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @ApiProperty({
    description: 'Nombre de la bolsa',
    example: 'Bolsa Pequeña Individual',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @ApiProperty({
    description: 'Tipo de bolsa',
    enum: BagType,
    example: BagType.SMALL,
  })
  @Column({
    type: 'enum',
    enum: BagType,
  })
  type!: BagType;

  @ApiProperty({
    description: 'Capacidad de la bolsa (cantidad de pares)',
    enum: BagCapacity,
    example: BagCapacity.INDIVIDUAL,
  })
  @Column({
    type: 'enum',
    enum: BagCapacity,
  })
  capacity!: BagCapacity;

  @ApiProperty({
    description: 'Stock actual en unidades',
    example: 1000.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock!: number;

  @ApiProperty({
    description: 'Stock mínimo requerido para alertas',
    example: 200.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStock!: number;

  @ApiProperty({
    description: 'Precio de compra por unidad',
    example: 0.5,
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
    description: 'Proveedor asociado a la bolsa',
    type: () => Supplier,
  })
  @ManyToOne(() => Supplier, { nullable: true, eager: false })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @ApiPropertyOptional({
    description: 'Registros de movimientos de stock',
    type: () => [BagMovement],
  })
  @OneToMany(() => BagMovement, (movement) => movement.bag, {
    cascade: false,
  })
  movements?: BagMovement[];

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
