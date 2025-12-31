import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishedSock } from './entities/finished-sock.entity';
import { FinishedSockMovement } from './entities/finished-sock-movement.entity';
import { ProductSpec } from '../product-specs/entities/product-spec.entity';
import { ProductionOrder } from '../production-orders/entities/production-order.entity';
import { CreateFinishedSockDto } from './dto/create-finished-sock.dto';
import { UpdateFinishedSockDto } from './dto/update-finished-sock.dto';
import { QueryFinishedSockDto } from './dto/query-finished-sock.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { MovementType } from './enums/movement-type.enum';

@Injectable()
export class FinishedSocksService {
  constructor(
    @InjectRepository(FinishedSock)
    private readonly finishedSockRepository: Repository<FinishedSock>,
    @InjectRepository(FinishedSockMovement)
    private readonly finishedSockMovementRepository: Repository<FinishedSockMovement>,
    @InjectRepository(ProductSpec)
    private readonly productSpecRepository: Repository<ProductSpec>,
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
  ) {}

  async create(
    createFinishedSockDto: CreateFinishedSockDto,
  ): Promise<FinishedSock> {
    // Validar que no exista ya un registro con el mismo productSpecId + size
    const existingFinishedSock = await this.finishedSockRepository.findOne({
      where: {
        productSpecId: createFinishedSockDto.productSpecId,
        size: createFinishedSockDto.size,
      },
    });

    if (existingFinishedSock) {
      throw new ConflictException(
        `Ya existe un registro de media terminada para la ficha técnica ${createFinishedSockDto.productSpecId} con talla ${createFinishedSockDto.size}`,
      );
    }

    // Validar que la ficha técnica exista
    const productSpec = await this.productSpecRepository.findOne({
      where: { id: createFinishedSockDto.productSpecId },
    });

    if (!productSpec) {
      throw new NotFoundException(
        `Ficha técnica con ID ${createFinishedSockDto.productSpecId} no encontrada`,
      );
    }

    const finishedSock = this.finishedSockRepository.create({
      ...createFinishedSockDto,
      currentStock: 0, // Stock inicial siempre es 0
      minStock: createFinishedSockDto.minStock || 0,
    });

    return await this.finishedSockRepository.save(finishedSock);
  }

  async findAll(queryDto: QueryFinishedSockDto): Promise<{
    items: FinishedSock[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.finishedSockRepository.createQueryBuilder('finishedSock');
    queryBuilder.leftJoinAndSelect('finishedSock.productSpec', 'productSpec');

    // Aplicar filtros
    if (filters.productSpecId) {
      queryBuilder.andWhere('finishedSock.productSpecId = :productSpecId', {
        productSpecId: filters.productSpecId,
      });
    }
    if (filters.size) {
      queryBuilder.andWhere('finishedSock.size = :size', {
        size: filters.size,
      });
    }

    // Búsqueda general (buscar en código de ficha técnica)
    if (search) {
      queryBuilder.andWhere('productSpec.code LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('finishedSock.createdAt', 'DESC')
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

  async findOne(id: string): Promise<FinishedSock> {
    const finishedSock = await this.finishedSockRepository.findOne({
      where: { id },
      relations: ['productSpec'],
    });

    if (!finishedSock) {
      throw new NotFoundException(`Media terminada con ID ${id} no encontrada`);
    }

    return finishedSock;
  }

  async update(
    id: string,
    updateFinishedSockDto: UpdateFinishedSockDto,
  ): Promise<FinishedSock> {
    const finishedSock = await this.findOne(id);

    // Si se intenta actualizar productSpecId o size, verificar que no exista otro con esa combinación
    if (
      (updateFinishedSockDto.productSpecId &&
        updateFinishedSockDto.productSpecId !== finishedSock.productSpecId) ||
      (updateFinishedSockDto.size &&
        updateFinishedSockDto.size !== finishedSock.size)
    ) {
      const newProductSpecId =
        updateFinishedSockDto.productSpecId || finishedSock.productSpecId;
      const newSize = updateFinishedSockDto.size || finishedSock.size;

      const existingFinishedSock = await this.finishedSockRepository.findOne({
        where: {
          productSpecId: newProductSpecId,
          size: newSize,
        },
      });

      if (existingFinishedSock && existingFinishedSock.id !== id) {
        throw new ConflictException(
          `Ya existe un registro de media terminada para la ficha técnica ${newProductSpecId} con talla ${newSize}`,
        );
      }
    }

    // Validar que la ficha técnica exista si se actualiza
    if (updateFinishedSockDto.productSpecId) {
      const productSpec = await this.productSpecRepository.findOne({
        where: { id: updateFinishedSockDto.productSpecId },
      });

      if (!productSpec) {
        throw new NotFoundException(
          `Ficha técnica con ID ${updateFinishedSockDto.productSpecId} no encontrada`,
        );
      }
    }

    Object.assign(finishedSock, updateFinishedSockDto);
    return await this.finishedSockRepository.save(finishedSock);
  }

  async remove(id: string): Promise<FinishedSock> {
    const finishedSock = await this.findOne(id);
    await this.finishedSockRepository.remove(finishedSock);
    return finishedSock;
  }

  async registerStockMovement(
    id: string,
    movementDto: StockMovementDto,
  ): Promise<FinishedSock> {
    const finishedSock = await this.findOne(id);

    // Si es movimiento de tipo PRODUCTION, validar productionOrderId
    if (movementDto.type === MovementType.PRODUCTION) {
      if (!movementDto.productionOrderId) {
        throw new BadRequestException(
          'El campo productionOrderId es requerido para movimientos de tipo PRODUCTION',
        );
      }

      const productionOrder = await this.productionOrderRepository.findOne({
        where: { id: movementDto.productionOrderId },
      });

      if (!productionOrder) {
        throw new NotFoundException(
          `Orden de producción con ID ${movementDto.productionOrderId} no encontrada`,
        );
      }
    }

    // Determinar si es entrada o salida
    const isEntry = movementDto.type === MovementType.PRODUCTION;

    let newStock: number;

    if (isEntry) {
      // Entrada: sumar al stock actual
      newStock =
        Number(finishedSock.currentStock) + Number(movementDto.quantity);
    } else {
      // Salida: restar del stock actual (SALE, LOSS, ADJUSTMENT)
      newStock =
        Number(finishedSock.currentStock) - Number(movementDto.quantity);

      // Validar que no quede stock negativo
      if (newStock < 0) {
        throw new BadRequestException(
          `No hay suficiente stock. Stock actual: ${finishedSock.currentStock}, cantidad a retirar: ${movementDto.quantity}`,
        );
      }
    }

    // Crear registro de movimiento
    const movement = this.finishedSockMovementRepository.create({
      finishedSockId: id,
      quantity: movementDto.quantity,
      type: movementDto.type,
      reason: movementDto.reason,
      productionOrderId:
        movementDto.type === MovementType.PRODUCTION
          ? movementDto.productionOrderId
          : undefined,
    });

    await this.finishedSockMovementRepository.save(movement);

    // Actualizar el stock
    finishedSock.currentStock = newStock;
    return await this.finishedSockRepository.save(finishedSock);
  }

  async getStockAlerts(): Promise<FinishedSock[]> {
    return this.finishedSockRepository
      .createQueryBuilder('finishedSock')
      .leftJoinAndSelect('finishedSock.productSpec', 'productSpec')
      .where('finishedSock.currentStock < finishedSock.minStock')
      .orderBy('finishedSock.currentStock', 'ASC')
      .getMany();
  }
}
