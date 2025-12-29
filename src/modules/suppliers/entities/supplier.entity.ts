import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Thread } from '../../threads/entities/thread.entity';

@Entity('suppliers')
export class Supplier {
  @ApiProperty({
    description: 'ID único del proveedor (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Proveedor Textil S.A.',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200, unique: true })
  name!: string;

  @ApiPropertyOptional({
    description: 'Código único del proveedor',
    example: 'PROV-001',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code?: string;

  @ApiPropertyOptional({
    description: 'Nombre de contacto del proveedor',
    example: 'Juan Pérez',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto',
    example: 'contacto@proveedor.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+57 300 123 4567',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección del proveedor',
    example: 'Calle 123 #45-67, Bogotá',
  })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el proveedor',
    example: 'Proveedor preferencial para hilos de algodón',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Indica si el proveedor está activo',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

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

  @ApiPropertyOptional({
    description: 'Hilos asociados al proveedor',
    type: () => [Thread],
  })
  @OneToMany(() => Thread, (thread: Thread) => thread.supplier)
  threads?: Thread[];
}
