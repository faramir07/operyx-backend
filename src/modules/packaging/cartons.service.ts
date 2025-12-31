import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carton } from './entities/carton.entity';
import { CartonMovement } from './entities/carton-movement.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreateCartonDto } from './dto/create-carton.dto';
import { UpdateCartonDto } from './dto/update-carton.dto';
import { QueryCartonDto } from './dto/query-carton.dto';
import { CartonMovementDto } from './dto/carton-movement.dto';
import { MovementType } from './enums/movement-type.enum';

@Injectable()
export class CartonsService {
  constructor(
    @InjectRepository(Carton)
    private readonly cartonRepository: Repository<Carton>,
    @InjectRepository(CartonMovement)
    private readonly cartonMovementRepository: Repository<CartonMovement>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createCartonDto: CreateCartonDto): Promise<Carton> {
    // Verificar si ya existe un cartón con el mismo código
    const existingCarton = await this.cartonRepository.findOne({
      where: { code: createCartonDto.code },
    });

    if (existingCarton) {
      throw new ConflictException(
        `Ya existe un cartón con el código ${createCartonDto.code}`,
      );
    }

    // Si se proporciona supplierId, validar que el proveedor exista
    if (createCartonDto.supplierId) {
      const supplierCount = await this.supplierRepository.count({
        where: { id: createCartonDto.supplierId },
      });

      if (supplierCount === 0) {
        throw new NotFoundException(
          `Proveedor con ID ${createCartonDto.supplierId} no encontrado`,
        );
      }
    }

    const carton = this.cartonRepository.create({
      ...createCartonDto,
      currentStock: 0, // Stock inicial siempre es 0
      minStock: createCartonDto.minStock || 0,
    });

    return await this.cartonRepository.save(carton);
  }

  async findAll(queryDto: QueryCartonDto): Promise<{
    items: Carton[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.cartonRepository.createQueryBuilder('carton');
    queryBuilder.leftJoinAndSelect('carton.supplier', 'supplier');

    // Aplicar filtros
    if (filters.code) {
      queryBuilder.andWhere('carton.code = :code', { code: filters.code });
    }
    if (filters.name) {
      queryBuilder.andWhere('carton.name = :name', { name: filters.name });
    }
    if (filters.supplierId) {
      queryBuilder.andWhere('carton.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(carton.code LIKE :search OR carton.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('carton.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Carton> {
    const carton = await this.cartonRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!carton) {
      throw new NotFoundException(`Cartón con ID ${id} no encontrado`);
    }

    return carton;
  }

  async update(id: string, updateCartonDto: UpdateCartonDto): Promise<Carton> {
    const carton = await this.findOne(id);

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (updateCartonDto.code && updateCartonDto.code !== carton.code) {
      const existingCarton = await this.cartonRepository.findOne({
        where: { code: updateCartonDto.code },
      });

      if (existingCarton) {
        throw new ConflictException(
          `Ya existe un cartón con el código ${updateCartonDto.code}`,
        );
      }
    }

    // Si se proporciona supplierId, validar que el proveedor exista
    if (updateCartonDto.supplierId !== undefined) {
      if (updateCartonDto.supplierId) {
        const supplierCount = await this.supplierRepository.count({
          where: { id: updateCartonDto.supplierId },
        });

        if (supplierCount === 0) {
          throw new NotFoundException(
            `Proveedor con ID ${updateCartonDto.supplierId} no encontrado`,
          );
        }
      }
    }

    Object.assign(carton, updateCartonDto);
    return await this.cartonRepository.save(carton);
  }

  async remove(id: string): Promise<Carton> {
    const carton = await this.findOne(id);
    await this.cartonRepository.remove(carton);
    return carton;
  }

  async registerStockMovement(
    id: string,
    movementDto: CartonMovementDto,
  ): Promise<Carton> {
    const carton = await this.findOne(id);

    // Determinar si es entrada o salida
    const isEntry = movementDto.type === MovementType.PURCHASE;
    // ADJUSTMENT puede ser entrada o salida, pero para simplificar lo tratamos como salida si es negativo

    let newStock: number;

    if (isEntry) {
      // Entrada: sumar al stock actual
      newStock = Number(carton.currentStock) + Number(movementDto.quantity);
    } else {
      // Salida: restar del stock actual (USAGE, ADJUSTMENT, LOSS)
      newStock = Number(carton.currentStock) - Number(movementDto.quantity);

      // Validar que no quede stock negativo
      if (newStock < 0) {
        throw new BadRequestException(
          `No hay suficiente stock. Stock actual: ${carton.currentStock}, cantidad a retirar: ${movementDto.quantity}`,
        );
      }
    }

    // Crear registro de movimiento
    const movement = this.cartonMovementRepository.create({
      cartonId: id,
      quantity: movementDto.quantity,
      type: movementDto.type,
      reason: movementDto.reason,
    });

    await this.cartonMovementRepository.save(movement);

    // Actualizar el stock
    carton.currentStock = newStock;
    return await this.cartonRepository.save(carton);
  }
}
