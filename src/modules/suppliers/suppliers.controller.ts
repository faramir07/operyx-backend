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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Proveedor creado exitosamente',
    type: Supplier,
  })
  @ApiResponse({
    status: 409,
    description: 'El nombre o código del proveedor ya existe',
  })
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los proveedores con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Supplier' },
            },
            total: { type: 'number', example: 1 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  findAll(@Query() queryDto: QuerySupplierDto) {
    return this.suppliersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado',
    type: Supplier,
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findOne(@Param('id') id: string): Promise<Supplier> {
    return this.suppliersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiParam({ name: 'id', description: 'ID del proveedor (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado exitosamente',
    type: Supplier,
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El nombre o código del proveedor ya existe',
  })
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  @ApiParam({ name: 'id', description: 'ID del proveedor (UUID)' })
  @ApiResponse({ status: 204, description: 'Proveedor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.suppliersService.remove(id);
  }
}
