import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { QueryThreadDto } from './dto/query-thread.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Thread } from './entities/thread.entity';

@ApiTags('threads')
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo hilo' })
  @ApiResponse({
    status: 201,
    description: 'Hilo creado exitosamente',
    type: Thread,
  })
  @ApiResponse({ status: 409, description: 'El código del hilo ya existe' })
  create(@Body() createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.threadsService.create(createThreadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los hilos con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de hilos obtenida exitosamente',
  })
  findAll(@Query() queryDto: QueryThreadDto) {
    return this.threadsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un hilo por ID' })
  @ApiParam({ name: 'id', description: 'ID del hilo (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Hilo encontrado',
    type: Thread,
  })
  @ApiResponse({ status: 404, description: 'Hilo no encontrado' })
  findOne(@Param('id') id: string): Promise<Thread> {
    return this.threadsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un hilo' })
  @ApiParam({ name: 'id', description: 'ID del hilo (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Hilo actualizado exitosamente',
    type: Thread,
  })
  @ApiResponse({ status: 404, description: 'Hilo no encontrado' })
  @ApiResponse({ status: 409, description: 'El código del hilo ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateThreadDto: UpdateThreadDto,
  ): Promise<Thread> {
    return this.threadsService.update(id, updateThreadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un hilo' })
  @ApiParam({ name: 'id', description: 'ID del hilo (UUID)' })
  @ApiResponse({ status: 204, description: 'Hilo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Hilo no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.threadsService.remove(id);
  }

  @Post(':id/movements')
  @ApiOperation({
    summary: 'Registrar movimiento de stock',
    description:
      'Registra una entrada (entry) o salida (exit) de stock para un hilo específico. Actualiza automáticamente el stock actual del material.',
  })
  @ApiParam({ name: 'id', description: 'ID del hilo (UUID)', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description:
      'Movimiento registrado exitosamente. Retorna el hilo actualizado con el nuevo stock.',
    type: Thread,
  })
  @ApiResponse({
    status: 400,
    description:
      'Stock insuficiente o datos inválidos. Se produce cuando se intenta retirar más stock del disponible.',
  })
  @ApiResponse({ status: 404, description: 'Hilo no encontrado' })
  registerStockMovement(
    @Param('id') id: string,
    @Body() movementDto: StockMovementDto,
  ): Promise<Thread> {
    return this.threadsService.registerStockMovement(id, movementDto);
  }

  @Put(':id/adjust-stock')
  @ApiOperation({
    summary: 'Rectificar/Ajustar inventario físico',
    description:
      'Ajusta el stock registrado al stock físico real después de un conteo. Calcula la diferencia, porcentaje de diferencia y peso de diferencia (considerando mermas, pérdidas, etc.).',
  })
  @ApiParam({ name: 'id', description: 'ID del hilo (UUID)', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description:
      'Inventario ajustado exitosamente. Retorna el hilo actualizado con los cálculos de diferencia.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            thread: { $ref: '#/components/schemas/Thread' },
            difference: {
              type: 'number',
              description:
                'Diferencia en kg (positivo = sobrante, negativo = faltante)',
              example: -5.5,
            },
            differencePercentage: {
              type: 'number',
              description:
                'Porcentaje de diferencia respecto al stock anterior',
              example: -5.5,
            },
            differenceWeight: {
              type: 'number',
              description: 'Peso de la diferencia en kg (valor absoluto)',
              example: 5.5,
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Hilo no encontrado' })
  adjustStock(@Param('id') id: string, @Body() adjustStockDto: AdjustStockDto) {
    return this.threadsService.adjustStock(id, adjustStockDto);
  }
}
