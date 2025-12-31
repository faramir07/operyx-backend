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
import { ProductionOrder } from './production-order.entity';

@Entity('partial_weights')
export class PartialWeight {
  @ApiProperty({
    description: 'ID único del registro de peso parcial (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID de la orden de producción asociada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid' })
  orderId!: string;

  @ApiPropertyOptional({
    description: 'Orden de producción asociada',
    type: () => ProductionOrder,
  })
  @ManyToOne(() => ProductionOrder, (order) => order.partialWeights, {
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'orderId' })
  order?: ProductionOrder;

  @ApiProperty({
    description: 'Peso parcial registrado en kilogramos',
    example: 1.25,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  weight!: number;

  @ApiPropertyOptional({
    description: 'Conteo parcial de medias en este registro',
    example: 50,
    minimum: 0,
  })
  @Column({ type: 'int', nullable: true })
  count?: number;

  @ApiPropertyOptional({
    description: 'Notas sobre este peso parcial',
    example: 'Peso después de primera hora de producción',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Fecha y hora en que se registró este peso parcial',
    example: '2023-01-01T12:00:00Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt!: Date;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T12:00:00Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-01T12:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
