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
import { FinishedSocksService } from './finished-socks.service';
import { CreateFinishedSockDto } from './dto/create-finished-sock.dto';
import { UpdateFinishedSockDto } from './dto/update-finished-sock.dto';
import { QueryFinishedSockDto } from './dto/query-finished-sock.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { FinishedSock } from './entities/finished-sock.entity';

@ApiTags('finished-socks')
@Controller('finished-socks')
export class FinishedSocksController {
  constructor(private readonly finishedSocksService: FinishedSocksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo registro de media terminada',
    description:
      'Crea un nuevo registro de media terminada. Valida que no exista otro registro con la misma combinación de ficha técnica y talla.',
  })
  @ApiResponse({
    status: 201,
    description: 'Media terminada creada exitosamente',
    type: FinishedSock,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Ficha técnica no encontrada',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe un registro con la misma combinación de ficha técnica y talla',
  })
  create(
    @Body() createFinishedSockDto: CreateFinishedSockDto,
  ): Promise<FinishedSock> {
    return this.finishedSocksService.create(createFinishedSockDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar medias terminadas',
    description:
      'Obtiene una lista paginada de medias terminadas con filtros opcionales (ficha técnica, talla)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de medias terminadas obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/FinishedSock' },
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
  findAll(@Query() queryDto: QueryFinishedSockDto) {
    return this.finishedSocksService.findAll(queryDto);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Obtener alertas de stock bajo',
    description:
      'Obtiene todas las medias terminadas cuyo stock actual está por debajo del stock mínimo configurado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas de stock bajo obtenida exitosamente',
    type: [FinishedSock],
  })
  getStockAlerts(): Promise<FinishedSock[]> {
    return this.finishedSocksService.getStockAlerts();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una media terminada por ID',
    description:
      'Obtiene los detalles completos de una media terminada específica, incluyendo información de la ficha técnica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la media terminada (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Media terminada encontrada exitosamente',
    type: FinishedSock,
  })
  @ApiResponse({
    status: 404,
    description: 'Media terminada no encontrada',
  })
  findOne(@Param('id') id: string): Promise<FinishedSock> {
    return this.finishedSocksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una media terminada',
    description:
      'Actualiza los datos de una media terminada existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la media terminada (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Media terminada actualizada exitosamente',
    type: FinishedSock,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Media terminada o ficha técnica no encontrada',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe otro registro con la misma combinación de ficha técnica y talla',
  })
  update(
    @Param('id') id: string,
    @Body() updateFinishedSockDto: UpdateFinishedSockDto,
  ): Promise<FinishedSock> {
    return this.finishedSocksService.update(id, updateFinishedSockDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una media terminada',
    description:
      'Elimina permanentemente un registro de media terminada del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la media terminada (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Media terminada eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Media terminada no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.finishedSocksService.remove(id);
  }

  @Post(':id/movements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar movimiento de stock',
    description:
      'Registra un movimiento de stock (entrada por producción, salida por venta, ajuste o pérdida) y actualiza el stock actual automáticamente. Para movimientos de tipo PRODUCTION, el campo productionOrderId es requerido.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la media terminada (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente y stock actualizado',
    type: FinishedSock,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, stock insuficiente o productionOrderId requerido para movimientos PRODUCTION',
  })
  @ApiResponse({
    status: 404,
    description: 'Media terminada u orden de producción no encontrada',
  })
  registerStockMovement(
    @Param('id') id: string,
    @Body() movementDto: StockMovementDto,
  ): Promise<FinishedSock> {
    return this.finishedSocksService.registerStockMovement(id, movementDto);
  }
}
