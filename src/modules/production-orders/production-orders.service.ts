import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrder } from './entities/production-order.entity';
import { PartialWeight } from './entities/partial-weight.entity';
import { ProductSpec } from '../product-specs/entities/product-spec.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Thread } from '../threads/entities/thread.entity';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { QueryProductionOrderDto } from './dto/query-production-order.dto';
import { StartProductionDto } from './dto/start-production.dto';
import { FinishProductionDto } from './dto/finish-production.dto';
import { PauseProductionDto } from './dto/pause-production.dto';
import { PartialWeightDto } from './dto/partial-weight.dto';
import { OrderStatus } from './enums/order-status.enum';
import { Priority } from './enums/priority.enum';
import { MachineStatus } from '../machines/enums/machine-status.enum';

@Injectable()
export class ProductionOrdersService {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
    @InjectRepository(PartialWeight)
    private readonly partialWeightRepository: Repository<PartialWeight>,
    @InjectRepository(ProductSpec)
    private readonly productSpecRepository: Repository<ProductSpec>,
    @InjectRepository(Machine)
    private readonly machineRepository: Repository<Machine>,
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}

  async create(
    createProductionOrderDto: CreateProductionOrderDto,
  ): Promise<ProductionOrder> {
    // Validar que la ficha técnica exista
    const productSpec = await this.productSpecRepository.findOne({
      where: { id: createProductionOrderDto.productSpecId },
    });

    if (!productSpec) {
      throw new NotFoundException(
        `Ficha técnica con ID ${createProductionOrderDto.productSpecId} no encontrada`,
      );
    }

    // Validar que la máquina exista
    const machine = await this.machineRepository.findOne({
      where: { id: createProductionOrderDto.machineId },
    });

    if (!machine) {
      throw new NotFoundException(
        `Máquina con ID ${createProductionOrderDto.machineId} no encontrada`,
      );
    }

    // Validar que la máquina no esté en mantenimiento o inactiva
    if (
      machine.status === MachineStatus.MAINTENANCE ||
      machine.status === MachineStatus.INACTIVE
    ) {
      throw new BadRequestException(
        `La máquina ${machine.code} está en estado ${machine.status} y no puede ser asignada`,
      );
    }

    // Validar que la máquina pueda producir la talla de la ficha técnica
    const machineSizes = machine.sizes ? machine.sizes.split(',') : [];
    if (!machineSizes.includes(productSpec.size)) {
      throw new BadRequestException(
        `La máquina ${machine.code} no puede producir la talla ${productSpec.size}. Tallas disponibles: ${machineSizes.join(', ')}`,
      );
    }

    // Calcular material necesario y verificar disponibilidad
    const materialNeeded = this.calculateMaterialNeeded(
      productSpec,
      createProductionOrderDto.quantity,
    );

    // Verificar disponibilidad de cada hilo
    for (const material of materialNeeded) {
      if (material.threadId && material.needed > 0) {
        const thread = await this.threadRepository.findOne({
          where: { id: material.threadId },
        });

        if (!thread) {
          throw new NotFoundException(
            `Hilo con ID ${material.threadId} no encontrado`,
          );
        }

        if (Number(thread.currentStock) < material.needed) {
          throw new BadRequestException(
            `Stock insuficiente de ${thread.code}. Disponible: ${thread.currentStock} kg, Necesario: ${material.needed} kg`,
          );
        }
      }
    }

    // Crear la orden
    const order = this.productionOrderRepository.create({
      ...createProductionOrderDto,
      status: OrderStatus.QUEUED,
      priority: createProductionOrderDto.priority || Priority.MEDIUM,
    });

    return await this.productionOrderRepository.save(order);
  }

  async findAll(queryDto: QueryProductionOrderDto): Promise<{
    items: ProductionOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.productionOrderRepository.createQueryBuilder('order');

    // Aplicar filtros
    if (filters.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: filters.status,
      });
    }
    if (filters.machineId) {
      queryBuilder.andWhere('order.machineId = :machineId', {
        machineId: filters.machineId,
      });
    }
    if (filters.productSpecId) {
      queryBuilder.andWhere('order.productSpecId = :productSpecId', {
        productSpecId: filters.productSpecId,
      });
    }
    if (filters.priority) {
      queryBuilder.andWhere('order.priority = :priority', {
        priority: filters.priority,
      });
    }

    // Búsqueda general (buscar en códigos de ficha técnica y máquina)
    if (search) {
      queryBuilder
        .leftJoin('order.productSpec', 'productSpec')
        .leftJoin('order.machine', 'machine')
        .andWhere(
          '(productSpec.code LIKE :search OR machine.code LIKE :search)',
          { search: `%${search}%` },
        );
    }

    const [items, total] = await queryBuilder
      .leftJoinAndSelect('order.productSpec', 'productSpec')
      .leftJoinAndSelect('order.machine', 'machine')
      .skip(skip)
      .take(limit)
      .orderBy('order.createdAt', 'DESC')
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

  async findOne(id: string): Promise<ProductionOrder> {
    const order = await this.productionOrderRepository.findOne({
      where: { id },
      relations: ['productSpec', 'machine', 'partialWeights'],
    });

    if (!order) {
      throw new NotFoundException(
        `Orden de producción con ID ${id} no encontrada`,
      );
    }

    return order;
  }

  async update(
    id: string,
    updateProductionOrderDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // Solo se puede actualizar si está en QUEUED o PAUSED
    if (
      order.status !== OrderStatus.QUEUED &&
      order.status !== OrderStatus.PAUSED
    ) {
      throw new BadRequestException(
        `No se puede actualizar una orden con estado ${order.status}. Solo se pueden actualizar órdenes en cola o pausadas`,
      );
    }

    // Si se actualiza la máquina, validar
    if (updateProductionOrderDto.machineId) {
      const machine = await this.machineRepository.findOne({
        where: { id: updateProductionOrderDto.machineId },
      });

      if (!machine) {
        throw new NotFoundException(
          `Máquina con ID ${updateProductionOrderDto.machineId} no encontrada`,
        );
      }

      if (
        machine.status === MachineStatus.MAINTENANCE ||
        machine.status === MachineStatus.INACTIVE
      ) {
        throw new BadRequestException(
          `La máquina ${machine.code} está en estado ${machine.status} y no puede ser asignada`,
        );
      }

      // Validar talla si también se actualiza la ficha técnica o usar la actual
      const productSpecId =
        updateProductionOrderDto.productSpecId || order.productSpecId;
      const productSpec = await this.productSpecRepository.findOne({
        where: { id: productSpecId },
      });

      if (productSpec) {
        const machineSizes = machine.sizes ? machine.sizes.split(',') : [];
        if (!machineSizes.includes(productSpec.size)) {
          throw new BadRequestException(
            `La máquina ${machine.code} no puede producir la talla ${productSpec.size}`,
          );
        }
      }
    }

    // Si se actualiza la ficha técnica, validar
    if (updateProductionOrderDto.productSpecId) {
      const productSpec = await this.productSpecRepository.findOne({
        where: { id: updateProductionOrderDto.productSpecId },
      });

      if (!productSpec) {
        throw new NotFoundException(
          `Ficha técnica con ID ${updateProductionOrderDto.productSpecId} no encontrada`,
        );
      }

      // Validar talla con la máquina actual o la nueva
      const machineId = updateProductionOrderDto.machineId || order.machineId;
      const machine = await this.machineRepository.findOne({
        where: { id: machineId },
      });

      if (machine) {
        const machineSizes = machine.sizes ? machine.sizes.split(',') : [];
        if (!machineSizes.includes(productSpec.size)) {
          throw new BadRequestException(
            `La máquina ${machine.code} no puede producir la talla ${productSpec.size}`,
          );
        }
      }

      // Si se actualiza cantidad, recalcular material necesario
      if (updateProductionOrderDto.quantity) {
        const materialNeeded = this.calculateMaterialNeeded(
          productSpec,
          updateProductionOrderDto.quantity,
        );

        // Verificar disponibilidad
        for (const material of materialNeeded) {
          if (material.threadId && material.needed > 0) {
            const thread = await this.threadRepository.findOne({
              where: { id: material.threadId },
            });

            if (thread && Number(thread.currentStock) < material.needed) {
              throw new BadRequestException(
                `Stock insuficiente de ${thread.code}. Disponible: ${thread.currentStock} kg, Necesario: ${material.needed} kg`,
              );
            }
          }
        }
      }
    }

    Object.assign(order, updateProductionOrderDto);
    return await this.productionOrderRepository.save(order);
  }

  async start(
    id: string,
    startProductionDto: StartProductionDto,
  ): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // Solo se puede iniciar si está en QUEUED o PAUSED
    if (
      order.status !== OrderStatus.QUEUED &&
      order.status !== OrderStatus.PAUSED
    ) {
      throw new BadRequestException(
        `No se puede iniciar una orden con estado ${order.status}. Solo se pueden iniciar órdenes en cola o pausadas`,
      );
    }

    // Validar que la máquina esté disponible (no en mantenimiento/inactiva)
    const machine = await this.machineRepository.findOne({
      where: { id: order.machineId },
    });

    if (!machine) {
      throw new NotFoundException(
        `Máquina con ID ${order.machineId} no encontrada`,
      );
    }

    if (
      machine.status === MachineStatus.MAINTENANCE ||
      machine.status === MachineStatus.INACTIVE
    ) {
      throw new BadRequestException(
        `La máquina ${machine.code} está en estado ${machine.status} y no puede iniciar producción`,
      );
    }

    // Actualizar estado y fecha de inicio
    order.status = OrderStatus.IN_PRODUCTION;
    order.startDate = startProductionDto.startDate || new Date();

    return await this.productionOrderRepository.save(order);
  }

  async pause(
    id: string,
    pauseProductionDto: PauseProductionDto,
  ): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // Solo se puede pausar si está en producción
    if (order.status !== OrderStatus.IN_PRODUCTION) {
      throw new BadRequestException(
        `No se puede pausar una orden con estado ${order.status}. Solo se pueden pausar órdenes en producción`,
      );
    }

    // Actualizar estado y agregar nota con razón de pausa
    order.status = OrderStatus.PAUSED;
    if (pauseProductionDto.reason) {
      const currentNotes = order.notes || '';
      order.notes = currentNotes
        ? `${currentNotes}\n[Pausa: ${pauseProductionDto.reason}]`
        : `[Pausa: ${pauseProductionDto.reason}]`;
    }

    return await this.productionOrderRepository.save(order);
  }

  async resume(id: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // Solo se puede reanudar si está pausada
    if (order.status !== OrderStatus.PAUSED) {
      throw new BadRequestException(
        `No se puede reanudar una orden con estado ${order.status}. Solo se pueden reanudar órdenes pausadas`,
      );
    }

    // Actualizar estado
    order.status = OrderStatus.IN_PRODUCTION;

    return await this.productionOrderRepository.save(order);
  }

  async finish(
    id: string,
    finishProductionDto: FinishProductionDto,
  ): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // Solo se puede finalizar si está en producción o pausada
    if (
      order.status !== OrderStatus.IN_PRODUCTION &&
      order.status !== OrderStatus.PAUSED
    ) {
      throw new BadRequestException(
        `No se puede finalizar una orden con estado ${order.status}. Solo se pueden finalizar órdenes en producción o pausadas`,
      );
    }

    const endDate = finishProductionDto.endDate || new Date();

    // Calcular duración en segundos
    if (order.startDate) {
      const durationMs = endDate.getTime() - order.startDate.getTime();
      order.duration = Math.floor(durationMs / 1000);
    }

    // Registrar datos finales
    order.endDate = endDate;
    order.totalWeight = finishProductionDto.totalWeight;
    order.finalCount = finishProductionDto.finalCount;
    order.status = OrderStatus.COMPLETED;

    // Obtener la ficha técnica para calcular desperdicio
    const productSpec = await this.productSpecRepository.findOne({
      where: { id: order.productSpecId },
    });

    if (!productSpec) {
      throw new NotFoundException(
        `Ficha técnica con ID ${order.productSpecId} no encontrada`,
      );
    }

    // Calcular y descontar material usado (con desperdicio)
    await this.calculateAndDeductMaterial(productSpec, order);

    // Actualizar horas de trabajo de la máquina
    if (order.duration) {
      const hoursWorked = order.duration / 3600; // Convertir segundos a horas
      const machine = await this.machineRepository.findOne({
        where: { id: order.machineId },
      });

      if (machine) {
        machine.workingHours = Number(machine.workingHours) + hoursWorked;
        await this.machineRepository.save(machine);
      }
    }

    order.wasteCalculated = true;

    return await this.productionOrderRepository.save(order);
  }

  async cancel(id: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // No se puede cancelar si ya está completada
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'No se puede cancelar una orden que ya está completada',
      );
    }

    // Cambiar estado a cancelado
    order.status = OrderStatus.CANCELLED;

    return await this.productionOrderRepository.save(order);
  }

  async addPartialWeight(
    id: string,
    partialWeightDto: PartialWeightDto,
  ): Promise<PartialWeight> {
    const order = await this.findOne(id);

    // Solo se puede agregar peso parcial si está en producción
    if (order.status !== OrderStatus.IN_PRODUCTION) {
      throw new BadRequestException(
        `No se puede agregar peso parcial a una orden con estado ${order.status}. Solo se pueden agregar pesos parciales a órdenes en producción`,
      );
    }

    // Crear registro de peso parcial
    const partialWeight = this.partialWeightRepository.create({
      orderId: id,
      weight: partialWeightDto.weight,
      count: partialWeightDto.count,
      notes: partialWeightDto.notes,
      recordedAt: new Date(),
    });

    return await this.partialWeightRepository.save(partialWeight);
  }

  async getMachineHistory(machineId: string): Promise<ProductionOrder[]> {
    // Validar que la máquina exista
    const machineCount = await this.machineRepository.count({
      where: { id: machineId },
    });

    if (machineCount === 0) {
      throw new NotFoundException(`Máquina con ID ${machineId} no encontrada`);
    }

    // Obtener órdenes completadas de la máquina
    const orders = await this.productionOrderRepository.find({
      where: {
        machineId,
        status: OrderStatus.COMPLETED,
      },
      relations: ['productSpec', 'partialWeights'],
      order: {
        endDate: 'DESC',
      },
    });

    return orders;
  }

  // Métodos privados auxiliares

  private calculateMaterialNeeded(
    productSpec: ProductSpec,
    quantity: number,
  ): Array<{ threadId?: string; type: string; needed: number }> {
    const materialNeeded: Array<{
      threadId?: string;
      type: string;
      needed: number;
    }> = [];

    // Calcular peso total necesario
    const totalWeightNeeded = Number(productSpec.weight) * quantity;

    // Calcular material por cada tipo de hilo usando porcentajes
    if (
      productSpec.elasticThreadId &&
      productSpec.elasticThreadPercentage !== undefined &&
      productSpec.elasticThreadPercentage !== null
    ) {
      materialNeeded.push({
        threadId: productSpec.elasticThreadId,
        type: 'elastic',
        needed:
          (totalWeightNeeded * Number(productSpec.elasticThreadPercentage)) /
          100,
      });
    }

    if (
      productSpec.lycraThreadId &&
      productSpec.lycraThreadPercentage !== undefined &&
      productSpec.lycraThreadPercentage !== null
    ) {
      materialNeeded.push({
        threadId: productSpec.lycraThreadId,
        type: 'lycra',
        needed:
          (totalWeightNeeded * Number(productSpec.lycraThreadPercentage)) / 100,
      });
    }

    if (
      productSpec.baseThreadId &&
      productSpec.baseThreadPercentage !== undefined &&
      productSpec.baseThreadPercentage !== null
    ) {
      materialNeeded.push({
        threadId: productSpec.baseThreadId,
        type: 'base',
        needed:
          (totalWeightNeeded * Number(productSpec.baseThreadPercentage)) / 100,
      });
    }

    return materialNeeded;
  }

  private async calculateAndDeductMaterial(
    productSpec: ProductSpec,
    order: ProductionOrder,
  ): Promise<void> {
    if (!order.totalWeight || !order.finalCount) {
      return;
    }

    const actualWeight = Number(order.totalWeight);

    // Calcular material usado real basado en el peso total final y porcentajes
    // Material usado por hilo = (peso_total_final * porcentaje_hilo) / 100
    if (
      productSpec.elasticThreadId &&
      productSpec.elasticThreadPercentage !== undefined &&
      productSpec.elasticThreadPercentage !== null
    ) {
      const materialUsed =
        (actualWeight * Number(productSpec.elasticThreadPercentage)) / 100;

      const thread = await this.threadRepository.findOne({
        where: { id: productSpec.elasticThreadId },
      });

      if (thread) {
        const newStock = Number(thread.currentStock) - materialUsed;
        thread.currentStock = newStock >= 0 ? newStock : 0;
        await this.threadRepository.save(thread);
      }
    }

    if (
      productSpec.lycraThreadId &&
      productSpec.lycraThreadPercentage !== undefined &&
      productSpec.lycraThreadPercentage !== null
    ) {
      const materialUsed =
        (actualWeight * Number(productSpec.lycraThreadPercentage)) / 100;

      const thread = await this.threadRepository.findOne({
        where: { id: productSpec.lycraThreadId },
      });

      if (thread) {
        const newStock = Number(thread.currentStock) - materialUsed;
        thread.currentStock = newStock >= 0 ? newStock : 0;
        await this.threadRepository.save(thread);
      }
    }

    if (
      productSpec.baseThreadId &&
      productSpec.baseThreadPercentage !== undefined &&
      productSpec.baseThreadPercentage !== null
    ) {
      const materialUsed =
        (actualWeight * Number(productSpec.baseThreadPercentage)) / 100;

      const thread = await this.threadRepository.findOne({
        where: { id: productSpec.baseThreadId },
      });

      if (thread) {
        const newStock = Number(thread.currentStock) - materialUsed;
        thread.currentStock = newStock >= 0 ? newStock : 0;
        await this.threadRepository.save(thread);
      }
    }
  }
}
