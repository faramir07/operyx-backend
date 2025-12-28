import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from './entities/thread.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { QueryThreadDto } from './dto/query-thread.dto';
import { StockMovementDto, MovementType } from './dto/stock-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    // Verificar si ya existe un hilo con el mismo código
    const existingThread = await this.threadRepository.findOne({
      where: { code: createThreadDto.code },
    });

    if (existingThread) {
      throw new ConflictException(
        `Ya existe un hilo con el código ${createThreadDto.code}`,
      );
    }

    const thread = this.threadRepository.create({
      ...createThreadDto,
      currentStock: createThreadDto.currentStock || 0,
    });

    return await this.threadRepository.save(thread);
  }

  async findAll(queryDto: QueryThreadDto): Promise<{
    items: Thread[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.threadRepository.createQueryBuilder('thread');

    // Aplicar filtros
    if (filters.code) {
      queryBuilder.andWhere('thread.code = :code', { code: filters.code });
    }
    if (filters.type) {
      queryBuilder.andWhere('thread.type = :type', { type: filters.type });
    }
    if (filters.brand) {
      queryBuilder.andWhere('thread.brand = :brand', { brand: filters.brand });
    }
    if (filters.gauge) {
      queryBuilder.andWhere('thread.gauge = :gauge', { gauge: filters.gauge });
    }
    if (filters.color) {
      queryBuilder.andWhere('thread.color = :color', { color: filters.color });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(thread.code LIKE :search OR thread.type LIKE :search OR thread.brand LIKE :search OR thread.color LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('thread.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items: data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Thread> {
    const thread = await this.threadRepository.findOne({ where: { id } });

    if (!thread) {
      throw new NotFoundException(`Hilo con ID ${id} no encontrado`);
    }

    return thread;
  }

  async update(id: string, updateThreadDto: UpdateThreadDto): Promise<Thread> {
    const thread = await this.findOne(id);

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (updateThreadDto.code && updateThreadDto.code !== thread.code) {
      const existingThread = await this.threadRepository.findOne({
        where: { code: updateThreadDto.code },
      });

      if (existingThread) {
        throw new ConflictException(
          `Ya existe un hilo con el código ${updateThreadDto.code}`,
        );
      }
    }

    Object.assign(thread, updateThreadDto);
    return await this.threadRepository.save(thread);
  }

  async remove(id: string): Promise<Thread> {
    const thread = await this.findOne(id);
    await this.threadRepository.remove(thread);
    return thread;
  }

  async registerStockMovement(
    id: string,
    movementDto: StockMovementDto,
  ): Promise<Thread> {
    const thread = await this.findOne(id);

    let newStock: number;

    if (movementDto.type === MovementType.ENTRY) {
      // Entrada: sumar al stock actual
      newStock = Number(thread.currentStock) + Number(movementDto.quantity);
    } else {
      // Salida: restar del stock actual
      newStock = Number(thread.currentStock) - Number(movementDto.quantity);

      // Validar que no quede stock negativo
      if (newStock < 0) {
        throw new BadRequestException(
          `No hay suficiente stock. Stock actual: ${thread.currentStock}, cantidad a retirar: ${movementDto.quantity}`,
        );
      }
    }

    // Actualizar el stock
    thread.currentStock = newStock;

    return await this.threadRepository.save(thread);
  }

  async adjustStock(
    id: string,
    adjustStockDto: AdjustStockDto,
  ): Promise<{
    thread: Thread;
    difference: number;
    differencePercentage: number;
    differenceWeight: number;
  }> {
    const thread = await this.findOne(id);

    const currentStock = Number(thread.currentStock);
    const physicalStock = Number(adjustStockDto.physicalStock);

    // Calcular diferencia en peso (kg)
    // La diferencia es: stock físico - stock registrado
    // Positivo = sobrante, Negativo = faltante (merma)
    const difference = physicalStock - currentStock;

    // Calcular porcentaje de diferencia respecto al stock anterior
    const differencePercentage =
      currentStock > 0
        ? (difference / currentStock) * 100
        : physicalStock > 0
          ? 100
          : 0;

    // El peso de la diferencia es simplemente el valor absoluto de la diferencia en kg
    // Ya que el stock está medido en kg
    const differenceWeight = Math.abs(difference);

    // Actualizar el stock al valor físico
    thread.currentStock = physicalStock;
    const updatedThread = await this.threadRepository.save(thread);

    return {
      thread: updatedThread,
      difference,
      differencePercentage: Number(differencePercentage.toFixed(2)),
      differenceWeight: Number(differenceWeight.toFixed(3)),
    };
  }
}
