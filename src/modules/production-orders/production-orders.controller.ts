import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionOrdersService } from './production-orders.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { QueryProductionOrderDto } from './dto/query-production-order.dto';
import { StartProductionDto } from './dto/start-production.dto';
import { FinishProductionDto } from './dto/finish-production.dto';
import { PauseProductionDto } from './dto/pause-production.dto';
import { PartialWeightDto } from './dto/partial-weight.dto';
import { ProductionOrder } from './entities/production-order.entity';
import { PartialWeight } from './entities/partial-weight.entity';

@ApiTags('production-orders')
@Controller('production-orders')
export class ProductionOrdersController {
  constructor(
    private readonly productionOrdersService: ProductionOrdersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva orden de producción',
    description:
      'Crea una nueva orden de producción. Valida disponibilidad de material, compatibilidad de máquina y talla, y que la máquina no esté en mantenimiento.',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden de producción creada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, máquina no disponible, talla incompatible o material insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Ficha técnica o máquina no encontrada',
  })
  create(
    @Body() createProductionOrderDto: CreateProductionOrderDto,
  ): Promise<ProductionOrder> {
    return this.productionOrdersService.create(createProductionOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar órdenes de producción',
    description:
      'Obtiene una lista paginada de órdenes de producción con filtros opcionales (estado, máquina, ficha técnica, prioridad)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes de producción obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductionOrder' },
            },
            total: { type: 'number', example: 10 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  findAll(@Query() queryDto: QueryProductionOrderDto) {
    return this.productionOrdersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una orden de producción por ID',
    description:
      'Obtiene los detalles completos de una orden de producción específica, incluyendo ficha técnica, máquina y pesos parciales',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de producción encontrada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción no encontrada',
  })
  findOne(@Param('id') id: string): Promise<ProductionOrder> {
    return this.productionOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una orden de producción',
    description:
      'Actualiza los datos de una orden de producción existente. Solo se puede actualizar si está en cola o pausada. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de producción actualizada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, estado no permitido, máquina no disponible, talla incompatible o material insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción, ficha técnica o máquina no encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductionOrderDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrder> {
    return this.productionOrdersService.update(id, updateProductionOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancelar una orden de producción',
    description:
      'Cancela una orden de producción. No se puede cancelar una orden que ya está completada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Orden de producción cancelada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar una orden completada',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción no encontrada',
  })
  async cancel(@Param('id') id: string): Promise<void> {
    await this.productionOrdersService.cancel(id);
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Iniciar producción de una orden',
    description:
      'Inicia la producción de una orden. Cambia el estado a "en producción" y registra la fecha de inicio. Solo se puede iniciar si está en cola o pausada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Producción iniciada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 400,
    description: 'Estado no permitido o máquina no disponible',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción o máquina no encontrada',
  })
  start(
    @Param('id') id: string,
    @Body() startProductionDto: StartProductionDto,
  ): Promise<ProductionOrder> {
    return this.productionOrdersService.start(id, startProductionDto);
  }

  @Post(':id/finish')
  @ApiOperation({
    summary: 'Finalizar producción de una orden',
    description:
      'Finaliza la producción de una orden. Registra fecha de fin, peso total, conteo final, calcula duración, calcula y descuenta material usado, y actualiza horas de trabajo de la máquina.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Producción finalizada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 400,
    description: 'Estado no permitido',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción o ficha técnica no encontrada',
  })
  finish(
    @Param('id') id: string,
    @Body() finishProductionDto: FinishProductionDto,
  ): Promise<ProductionOrder> {
    return this.productionOrdersService.finish(id, finishProductionDto);
  }

  @Post(':id/pause')
  @ApiOperation({
    summary: 'Pausar producción de una orden',
    description:
      'Pausa la producción de una orden. Cambia el estado a "pausado" y registra la razón de la pausa. Solo se puede pausar si está en producción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Producción pausada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 400,
    description:
      'Estado no permitido (solo se pueden pausar órdenes en producción)',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción no encontrada',
  })
  pause(
    @Param('id') id: string,
    @Body() pauseProductionDto: PauseProductionDto,
  ): Promise<ProductionOrder> {
    return this.productionOrdersService.pause(id, pauseProductionDto);
  }

  @Post(':id/resume')
  @ApiOperation({
    summary: 'Reanudar producción de una orden',
    description:
      'Reanuda la producción de una orden pausada. Cambia el estado a "en producción". Solo se puede reanudar si está pausada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Producción reanudada exitosamente',
    type: ProductionOrder,
  })
  @ApiResponse({
    status: 400,
    description:
      'Estado no permitido (solo se pueden reanudar órdenes pausadas)',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción no encontrada',
  })
  resume(@Param('id') id: string): Promise<ProductionOrder> {
    return this.productionOrdersService.resume(id);
  }

  @Post(':id/partial-weights')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar peso parcial a una orden',
    description:
      'Registra un peso parcial durante la producción. Solo se puede agregar peso parcial si la orden está en producción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la orden de producción (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 201,
    description: 'Peso parcial registrado exitosamente',
    type: PartialWeight,
  })
  @ApiResponse({
    status: 400,
    description:
      'Estado no permitido (solo se pueden agregar pesos parciales a órdenes en producción)',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de producción no encontrada',
  })
  addPartialWeight(
    @Param('id') id: string,
    @Body() partialWeightDto: PartialWeightDto,
  ): Promise<PartialWeight> {
    return this.productionOrdersService.addPartialWeight(id, partialWeightDto);
  }

  @Get('machine/:machineId/history')
  @ApiOperation({
    summary: 'Obtener historial de órdenes completadas de una máquina',
    description:
      'Obtiene todas las órdenes de producción completadas de una máquina específica, ordenadas por fecha de finalización descendente.',
  })
  @ApiParam({
    name: 'machineId',
    description: 'ID único de la máquina (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
    type: [ProductionOrder],
  })
  @ApiResponse({
    status: 404,
    description: 'Máquina no encontrada',
  })
  getMachineHistory(
    @Param('machineId') machineId: string,
  ): Promise<ProductionOrder[]> {
    return this.productionOrdersService.getMachineHistory(machineId);
  }
}
