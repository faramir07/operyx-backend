import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinishedSock } from './finished-sock.entity';
import { ProductionOrder } from '../../production-orders/entities/production-order.entity';
import { MovementType } from '../enums/movement-type.enum';

@Entity('finished_sock_movements')
export class FinishedSockMovement {
  @ApiProperty({
    description: 'ID único del movimiento (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID de la media terminada asociada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid' })
  finishedSockId!: string;

  @ApiProperty({
    description: 'Media terminada asociada',
    type: () => FinishedSock,
  })
  @ManyToOne(() => FinishedSock, (finishedSock) => finishedSock.movements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'finishedSockId' })
  finishedSock!: FinishedSock;

  @ApiProperty({
    description: 'Cantidad en pares',
    example: 100.0,
    minimum: 0.01,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.PRODUCTION,
  })
  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type!: MovementType;

  @ApiPropertyOptional({
    description: 'Motivo o descripción del movimiento',
    example: 'Entrada por producción completada',
  })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiPropertyOptional({
    description:
      'ID de la orden de producción asociada (solo para movimientos de tipo PRODUCTION)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid', nullable: true })
  productionOrderId?: string;

  @ApiPropertyOptional({
    description: 'Orden de producción asociada',
    type: () => ProductionOrder,
  })
  @ManyToOne(() => ProductionOrder, { nullable: true, eager: false })
  @JoinColumn({ name: 'productionOrderId' })
  productionOrder?: ProductionOrder;

  @ApiProperty({
    description: 'Fecha de creación del movimiento',
    example: '2023-01-01T10:00:00Z',
  })
  @CreateDateColumn()
  createdAt!: Date;
}
