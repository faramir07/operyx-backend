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
import { CartonsService } from './cartons.service';
import { CreateCartonDto } from './dto/create-carton.dto';
import { UpdateCartonDto } from './dto/update-carton.dto';
import { QueryCartonDto } from './dto/query-carton.dto';
import { CartonMovementDto } from './dto/carton-movement.dto';
import { Carton } from './entities/carton.entity';

@ApiTags('packaging')
@Controller('cartons')
export class CartonsController {
  constructor(private readonly cartonsService: CartonsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo cartón',
    description:
      'Crea un nuevo registro de cartón con sus características y precio de compra',
  })
  @ApiResponse({
    status: 201,
    description: 'Cartón creado exitosamente',
    type: Carton,
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
    description: 'Ya existe un cartón con el código proporcionado',
  })
  create(@Body() createCartonDto: CreateCartonDto): Promise<Carton> {
    return this.cartonsService.create(createCartonDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar cartones',
    description:
      'Obtiene una lista paginada de cartones con filtros opcionales (código, nombre, proveedor)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cartones obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Carton' },
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
  findAll(@Query() queryDto: QueryCartonDto) {
    return this.cartonsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un cartón por ID',
    description:
      'Obtiene los detalles completos de un cartón específico, incluyendo información del proveedor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cartón (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartón encontrado exitosamente',
    type: Carton,
  })
  @ApiResponse({
    status: 404,
    description: 'Cartón no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Carton> {
    return this.cartonsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un cartón',
    description:
      'Actualiza los datos de un cartón existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cartón (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartón actualizado exitosamente',
    type: Carton,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Cartón o proveedor no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otro cartón con el código proporcionado',
  })
  update(
    @Param('id') id: string,
    @Body() updateCartonDto: UpdateCartonDto,
  ): Promise<Carton> {
    return this.cartonsService.update(id, updateCartonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un cartón',
    description: 'Elimina permanentemente un cartón del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cartón (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Cartón eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cartón no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.cartonsService.remove(id);
  }

  @Post(':id/movements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar movimiento de stock de cartón',
    description:
      'Registra un movimiento de stock (entrada por compra, salida por uso, ajuste o pérdida) y actualiza el stock actual automáticamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cartón (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente y stock actualizado',
    type: Carton,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cartón no encontrado',
  })
  registerStockMovement(
    @Param('id') id: string,
    @Body() movementDto: CartonMovementDto,
  ): Promise<Carton> {
    return this.cartonsService.registerStockMovement(id, movementDto);
  }
}
