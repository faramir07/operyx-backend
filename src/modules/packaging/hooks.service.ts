import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hook } from './entities/hook.entity';
import { HookMovement } from './entities/hook-movement.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreateHookDto } from './dto/create-hook.dto';
import { UpdateHookDto } from './dto/update-hook.dto';
import { QueryHookDto } from './dto/query-hook.dto';
import { HookMovementDto } from './dto/hook-movement.dto';
import { MovementType } from './enums/movement-type.enum';

@Injectable()
export class HooksService {
  constructor(
    @InjectRepository(Hook)
    private readonly hookRepository: Repository<Hook>,
    @InjectRepository(HookMovement)
    private readonly hookMovementRepository: Repository<HookMovement>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createHookDto: CreateHookDto): Promise<Hook> {
    // Verificar si ya existe un gancho con el mismo código
    const existingHook = await this.hookRepository.findOne({
      where: { code: createHookDto.code },
    });

    if (existingHook) {
      throw new ConflictException(
        `Ya existe un gancho con el código ${createHookDto.code}`,
      );
    }

    // Si se proporciona supplierId, validar que el proveedor exista
    if (createHookDto.supplierId) {
      const supplierCount = await this.supplierRepository.count({
        where: { id: createHookDto.supplierId },
      });

      if (supplierCount === 0) {
        throw new NotFoundException(
          `Proveedor con ID ${createHookDto.supplierId} no encontrado`,
        );
      }
    }

    const hook = this.hookRepository.create({
      ...createHookDto,
      currentStock: 0, // Stock inicial siempre es 0
      minStock: createHookDto.minStock || 0,
    });

    return await this.hookRepository.save(hook);
  }

  async findAll(queryDto: QueryHookDto): Promise<{
    items: Hook[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.hookRepository.createQueryBuilder('hook');
    queryBuilder.leftJoinAndSelect('hook.supplier', 'supplier');

    // Aplicar filtros
    if (filters.code) {
      queryBuilder.andWhere('hook.code = :code', { code: filters.code });
    }
    if (filters.name) {
      queryBuilder.andWhere('hook.name = :name', { name: filters.name });
    }
    if (filters.supplierId) {
      queryBuilder.andWhere('hook.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(hook.code LIKE :search OR hook.name LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('hook.createdAt', 'DESC')
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

  async findOne(id: string): Promise<Hook> {
    const hook = await this.hookRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!hook) {
      throw new NotFoundException(`Gancho con ID ${id} no encontrado`);
    }

    return hook;
  }

  async update(id: string, updateHookDto: UpdateHookDto): Promise<Hook> {
    const hook = await this.findOne(id);

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (updateHookDto.code && updateHookDto.code !== hook.code) {
      const existingHook = await this.hookRepository.findOne({
        where: { code: updateHookDto.code },
      });

      if (existingHook) {
        throw new ConflictException(
          `Ya existe un gancho con el código ${updateHookDto.code}`,
        );
      }
    }

    // Si se proporciona supplierId, validar que el proveedor exista
    if (updateHookDto.supplierId !== undefined) {
      if (updateHookDto.supplierId) {
        const supplierCount = await this.supplierRepository.count({
          where: { id: updateHookDto.supplierId },
        });

        if (supplierCount === 0) {
          throw new NotFoundException(
            `Proveedor con ID ${updateHookDto.supplierId} no encontrado`,
          );
        }
      }
    }

    Object.assign(hook, updateHookDto);
    return await this.hookRepository.save(hook);
  }

  async remove(id: string): Promise<Hook> {
    const hook = await this.findOne(id);
    await this.hookRepository.remove(hook);
    return hook;
  }

  async registerStockMovement(
    id: string,
    movementDto: HookMovementDto,
  ): Promise<Hook> {
    const hook = await this.findOne(id);

    // Determinar si es entrada o salida
    const isEntry = movementDto.type === MovementType.PURCHASE;

    let newStock: number;

    if (isEntry) {
      // Entrada: sumar al stock actual
      newStock = Number(hook.currentStock) + Number(movementDto.quantity);
    } else {
      // Salida: restar del stock actual (USAGE, ADJUSTMENT, LOSS)
      newStock = Number(hook.currentStock) - Number(movementDto.quantity);

      // Validar que no quede stock negativo
      if (newStock < 0) {
        throw new BadRequestException(
          `No hay suficiente stock. Stock actual: ${hook.currentStock}, cantidad a retirar: ${movementDto.quantity}`,
        );
      }
    }

    // Crear registro de movimiento
    const movement = this.hookMovementRepository.create({
      hookId: id,
      quantity: movementDto.quantity,
      type: movementDto.type,
      reason: movementDto.reason,
    });

    await this.hookMovementRepository.save(movement);

    // Actualizar el stock
    hook.currentStock = newStock;
    return await this.hookRepository.save(hook);
  }
}
