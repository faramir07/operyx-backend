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
import { HooksService } from './hooks.service';
import { CreateHookDto } from './dto/create-hook.dto';
import { UpdateHookDto } from './dto/update-hook.dto';
import { QueryHookDto } from './dto/query-hook.dto';
import { HookMovementDto } from './dto/hook-movement.dto';
import { Hook } from './entities/hook.entity';

@ApiTags('packaging')
@Controller('hooks')
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo gancho',
    description:
      'Crea un nuevo registro de gancho con precio de compra y características',
  })
  @ApiResponse({
    status: 201,
    description: 'Gancho creado exitosamente',
    type: Hook,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Proveedor no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un gancho con el código proporcionado',
  })
  create(@Body() createHookDto: CreateHookDto): Promise<Hook> {
    return this.hooksService.create(createHookDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar ganchos',
    description:
      'Obtiene una lista paginada de ganchos con filtros opcionales (código, nombre, proveedor)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ganchos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Hook' },
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
  findAll(@Query() queryDto: QueryHookDto) {
    return this.hooksService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un gancho por ID',
    description:
      'Obtiene los detalles completos de un gancho específico, incluyendo información del proveedor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del gancho (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Gancho encontrado exitosamente',
    type: Hook,
  })
  @ApiResponse({
    status: 404,
    description: 'Gancho no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Hook> {
    return this.hooksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un gancho',
    description:
      'Actualiza los datos de un gancho existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del gancho (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Gancho actualizado exitosamente',
    type: Hook,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Gancho o proveedor no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otro gancho con el código proporcionado',
  })
  update(
    @Param('id') id: string,
    @Body() updateHookDto: UpdateHookDto,
  ): Promise<Hook> {
    return this.hooksService.update(id, updateHookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un gancho',
    description: 'Elimina permanentemente un gancho del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del gancho (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Gancho eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Gancho no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.hooksService.remove(id);
  }

  @Post(':id/movements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar movimiento de stock de gancho',
    description:
      'Registra un movimiento de stock (entrada por compra, salida por uso, ajuste o pérdida) y actualiza el stock actual automáticamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del gancho (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente y stock actualizado',
    type: Hook,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Gancho no encontrado',
  })
  registerStockMovement(
    @Param('id') id: string,
    @Body() movementDto: HookMovementDto,
  ): Promise<Hook> {
    return this.hooksService.registerStockMovement(id, movementDto);
  }
}
