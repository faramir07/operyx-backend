import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bag } from './entities/bag.entity';
import { BagMovement } from './entities/bag-movement.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreateBagDto } from './dto/create-bag.dto';
import { UpdateBagDto } from './dto/update-bag.dto';
import { QueryBagDto } from './dto/query-bag.dto';
import { BagMovementDto } from './dto/bag-movement.dto';
import { MovementType } from './enums/movement-type.enum';

@Injectable()
export class BagsService {
  constructor(
    @InjectRepository(Bag)
    private readonly bagRepository: Repository<Bag>,
    @InjectRepository(BagMovement)
    private readonly bagMovementRepository: Repository<BagMovement>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createBagDto: CreateBagDto): Promise<Bag> {
    // Verificar si ya existe una bolsa con el mismo código
    const existingBag = await this.bagRepository.findOne({
      where: { code: createBagDto.code },
    });

    if (existingBag) {
      throw new ConflictException(
        `Ya existe una bolsa con el código ${createBagDto.code}`,
      );
    }

    // Si se proporciona supplierId, validar que el proveedor exista
    if (createBagDto.supplierId) {
      const supplierCount = await this.supplierRepository.count({
        where: { id: createBagDto.supplierId },
      });

      if (supplierCount === 0) {
        throw new NotFoundException(
          `Proveedor con ID ${createBagDto.supplierId} no encontrado`,
        );
      }
    }

    const bag = this.bagRepository.create({
      ...createBagDto,
      currentStock: 0, // Stock inicial siempre es 0
      minStock: createBagDto.minStock || 0,
    });

    return await this.bagRepository.save(bag);
  }

  async findAll(queryDto: QueryBagDto): Promise<{
    items: Bag[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bagRepository.createQueryBuilder('bag');
    queryBuilder.leftJoinAndSelect('bag.supplier', 'supplier');

    // Aplicar filtros
    if (filters.code) {
      queryBuilder.andWhere('bag.code = :code', { code: filters.code });
    }
    if (filters.name) {
      queryBuilder.andWhere('bag.name = :name', { name: filters.name });
    }
    if (filters.type) {
      queryBuilder.andWhere('bag.type = :type', { type: filters.type });
    }
    if (filters.capacity) {
      queryBuilder.andWhere('bag.capacity = :capacity', {
        capacity: filters.capacity,
      });
    }
    if (filters.supplierId) {
      queryBuilder.andWhere('bag.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(bag.code LIKE :search OR bag.name LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('bag.createdAt', 'DESC')
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

  async findOne(id: string): Promise<Bag> {
    const bag = await this.bagRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!bag) {
      throw new NotFoundException(`Bolsa con ID ${id} no encontrada`);
    }

    return bag;
  }

  async update(id: string, updateBagDto: UpdateBagDto): Promise<Bag> {
    const bag = await this.findOne(id);

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (updateBagDto.code && updateBagDto.code !== bag.code) {
      const existingBag = await this.bagRepository.findOne({
        where: { code: updateBagDto.code },
      });

      if (existingBag) {
        throw new ConflictException(
          `Ya existe una bolsa con el código ${updateBagDto.code}`,
        );
      }
    }

    // Si se proporciona supplierId, validar que el proveedor exista
    if (updateBagDto.supplierId !== undefined) {
      if (updateBagDto.supplierId) {
        const supplierCount = await this.supplierRepository.count({
          where: { id: updateBagDto.supplierId },
        });

        if (supplierCount === 0) {
          throw new NotFoundException(
            `Proveedor con ID ${updateBagDto.supplierId} no encontrado`,
          );
        }
      }
    }

    Object.assign(bag, updateBagDto);
    return await this.bagRepository.save(bag);
  }

  async remove(id: string): Promise<Bag> {
    const bag = await this.findOne(id);
    await this.bagRepository.remove(bag);
    return bag;
  }

  async registerStockMovement(
    id: string,
    movementDto: BagMovementDto,
  ): Promise<Bag> {
    const bag = await this.findOne(id);

    // Determinar si es entrada o salida
    const isEntry = movementDto.type === MovementType.PURCHASE;

    let newStock: number;

    if (isEntry) {
      // Entrada: sumar al stock actual
      newStock = Number(bag.currentStock) + Number(movementDto.quantity);
    } else {
      // Salida: restar del stock actual (USAGE, ADJUSTMENT, LOSS)
      newStock = Number(bag.currentStock) - Number(movementDto.quantity);

      // Validar que no quede stock negativo
      if (newStock < 0) {
        throw new BadRequestException(
          `No hay suficiente stock. Stock actual: ${bag.currentStock}, cantidad a retirar: ${movementDto.quantity}`,
        );
      }
    }

    // Crear registro de movimiento
    const movement = this.bagMovementRepository.create({
      bagId: id,
      quantity: movementDto.quantity,
      type: movementDto.type,
      reason: movementDto.reason,
    });

    await this.bagMovementRepository.save(movement);

    // Actualizar el stock
    bag.currentStock = newStock;
    return await this.bagRepository.save(bag);
  }
}
