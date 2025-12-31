import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSpec } from '../../product-specs/entities/product-spec.entity';
import { Size } from '../../product-specs/enums/size.enum';
import { FinishedSockMovement } from './finished-sock-movement.entity';

@Entity('finished_socks')
@Unique(['productSpecId', 'size'])
export class FinishedSock {
  @ApiProperty({
    description: 'ID único de la media terminada (UUID)',
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

  @ApiProperty({
    description: 'Ficha técnica asociada',
    type: () => ProductSpec,
  })
  @ManyToOne(() => ProductSpec, { nullable: false, eager: false })
  @JoinColumn({ name: 'productSpecId' })
  productSpec?: ProductSpec;

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

  @ApiProperty({
    description: 'Stock actual en pares',
    example: 1000.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock!: number;

  @ApiProperty({
    description: 'Stock mínimo requerido para alertas',
    example: 100.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStock!: number;

  @ApiProperty({
    description: 'Precio unitario por par',
    example: 5.99,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @ApiProperty({
    description: 'Precio por docena de pares',
    example: 65.99,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dozenPrice!: number;

  @ApiPropertyOptional({
    description: 'Registros de movimientos de stock',
    type: () => [FinishedSockMovement],
  })
  @OneToMany(() => FinishedSockMovement, (movement) => movement.finishedSock, {
    cascade: false,
  })
  movements?: FinishedSockMovement[];

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
