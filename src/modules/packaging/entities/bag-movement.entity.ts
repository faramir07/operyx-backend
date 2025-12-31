import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Bag } from './bag.entity';
import { MovementType } from '../enums/movement-type.enum';

@Entity('bag_movements')
export class BagMovement {
  @ApiProperty({
    description: 'ID único del movimiento (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID de la bolsa asociada',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Column({ type: 'uuid' })
  bagId!: string;

  @ApiProperty({
    description: 'Bolsa asociada',
    type: () => Bag,
  })
  @ManyToOne(() => Bag, (bag) => bag.movements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bagId' })
  bag!: Bag;

  @ApiProperty({
    description: 'Cantidad en unidades',
    example: 200.0,
    minimum: 0.01,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.PURCHASE,
  })
  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type!: MovementType;

  @ApiPropertyOptional({
    description: 'Motivo o descripción del movimiento',
    example: 'Compra de materiales',
  })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiProperty({
    description: 'Fecha de creación del movimiento',
    example: '2023-01-01T10:00:00Z',
  })
  @CreateDateColumn()
  createdAt!: Date;
}
