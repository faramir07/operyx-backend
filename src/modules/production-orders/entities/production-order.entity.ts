import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSpec } from '../../product-specs/entities/product-spec.entity';
import { Machine } from '../../machines/entities/machine.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { Priority } from '../enums/priority.enum';
import { PartialWeight } from './partial-weight.entity';

@Entity('production_orders')
export class ProductionOrder {
  @ApiProperty({
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID de la ficha técnica asociada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid' })
  productSpecId!: string;

  @ApiPropertyOptional({
    description: 'Ficha técnica asociada a la orden',
    type: () => ProductSpec,
  })
  @ManyToOne(() => ProductSpec, { nullable: false, eager: false })
  @JoinColumn({ name: 'productSpecId' })
  productSpec?: ProductSpec;

  @ApiProperty({
    description: 'ID de la máquina asignada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid' })
  machineId!: string;

  @ApiPropertyOptional({
    description: 'Máquina asignada a la orden',
    type: () => Machine,
  })
  @ManyToOne(() => Machine, { nullable: false, eager: false })
  @JoinColumn({ name: 'machineId' })
  machine?: Machine;

  @ApiProperty({
    description: 'Cantidad de pares de medias a producir',
    example: 100,
    minimum: 1,
  })
  @Column({ type: 'int' })
  quantity!: number;

  @ApiProperty({
    description: 'Estado actual de la orden',
    enum: OrderStatus,
    example: OrderStatus.QUEUED,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.QUEUED,
  })
  status!: OrderStatus;

  @ApiProperty({
    description: 'Prioridad de la orden',
    enum: Priority,
    example: Priority.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority!: Priority;

  @ApiPropertyOptional({
    description: 'Fecha y hora de inicio real de la producción',
    example: '2023-01-01T10:00:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Fecha y hora de finalización real de la producción',
    example: '2023-01-01T18:30:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Duración de la producción en segundos',
    example: 30600,
    minimum: 0,
  })
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Peso total final de la producción en kilogramos',
    example: 2.5,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  totalWeight?: number;

  @ApiPropertyOptional({
    description: 'Conteo final de pares de medias producidas',
    example: 98,
    minimum: 0,
  })
  @Column({ type: 'int', nullable: true })
  finalCount?: number;

  @ApiProperty({
    description: 'Indica si ya se calculó el desperdicio',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  wasteCalculated!: boolean;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la orden',
    example: 'Orden urgente para cliente importante',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T09:00:00Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-01T18:30:00Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Pesos parciales registrados durante la producción',
    type: () => [PartialWeight],
  })
  @OneToMany(() => PartialWeight, (partialWeight) => partialWeight.order)
  partialWeights?: PartialWeight[];
}
