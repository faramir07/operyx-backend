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
import { BagsService } from './bags.service';
import { CreateBagDto } from './dto/create-bag.dto';
import { UpdateBagDto } from './dto/update-bag.dto';
import { QueryBagDto } from './dto/query-bag.dto';
import { BagMovementDto } from './dto/bag-movement.dto';
import { Bag } from './entities/bag.entity';

@ApiTags('packaging')
@Controller('bags')
export class BagsController {
  constructor(private readonly bagsService: BagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva bolsa',
    description:
      'Crea un nuevo registro de bolsa con tipo, capacidad, precio de compra y características',
  })
  @ApiResponse({
    status: 201,
    description: 'Bolsa creada exitosamente',
    type: Bag,
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
    description: 'Ya existe una bolsa con el código proporcionado',
  })
  create(@Body() createBagDto: CreateBagDto): Promise<Bag> {
    return this.bagsService.create(createBagDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar bolsas',
    description:
      'Obtiene una lista paginada de bolsas con filtros opcionales (código, nombre, tipo, capacidad, proveedor)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de bolsas obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Bag' },
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
  findAll(@Query() queryDto: QueryBagDto) {
    return this.bagsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una bolsa por ID',
    description:
      'Obtiene los detalles completos de una bolsa específica, incluyendo información del proveedor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la bolsa (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Bolsa encontrada exitosamente',
    type: Bag,
  })
  @ApiResponse({
    status: 404,
    description: 'Bolsa no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Bag> {
    return this.bagsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una bolsa',
    description:
      'Actualiza los datos de una bolsa existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la bolsa (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Bolsa actualizada exitosamente',
    type: Bag,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Bolsa o proveedor no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra bolsa con el código proporcionado',
  })
  update(
    @Param('id') id: string,
    @Body() updateBagDto: UpdateBagDto,
  ): Promise<Bag> {
    return this.bagsService.update(id, updateBagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una bolsa',
    description: 'Elimina permanentemente una bolsa del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la bolsa (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Bolsa eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Bolsa no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.bagsService.remove(id);
  }

  @Post(':id/movements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar movimiento de stock de bolsa',
    description:
      'Registra un movimiento de stock (entrada por compra, salida por uso, ajuste o pérdida) y actualiza el stock actual automáticamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la bolsa (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente y stock actualizado',
    type: Bag,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Bolsa no encontrada',
  })
  registerStockMovement(
    @Param('id') id: string,
    @Body() movementDto: BagMovementDto,
  ): Promise<Bag> {
    return this.bagsService.registerStockMovement(id, movementDto);
  }
}
