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
import { ProductSpecsService } from './product-specs.service';
import { CreateProductSpecDto } from './dto/create-product-spec.dto';
import { UpdateProductSpecDto } from './dto/update-product-spec.dto';
import { QueryProductSpecDto } from './dto/query-product-spec.dto';
import { ProductSpec } from './entities/product-spec.entity';

@ApiTags('product-specs')
@Controller('product-specs')
export class ProductSpecsController {
  constructor(private readonly productSpecsService: ProductSpecsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva ficha técnica' })
  @ApiResponse({
    status: 201,
    description: 'Ficha técnica creada exitosamente',
    type: ProductSpec,
  })
  @ApiResponse({
    status: 409,
    description: 'El código de la ficha técnica ya existe',
  })
  @ApiResponse({
    status: 404,
    description: 'Uno de los hilos relacionados no existe',
  })
  create(
    @Body() createProductSpecDto: CreateProductSpecDto,
  ): Promise<ProductSpec> {
    return this.productSpecsService.create(createProductSpecDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las fichas técnicas con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas técnicas obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductSpec' },
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
  findAll(@Query() queryDto: QueryProductSpecDto) {
    return this.productSpecsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ficha técnica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la ficha técnica (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Ficha técnica encontrada',
    type: ProductSpec,
  })
  @ApiResponse({ status: 404, description: 'Ficha técnica no encontrada' })
  findOne(@Param('id') id: string): Promise<ProductSpec> {
    return this.productSpecsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una ficha técnica' })
  @ApiParam({ name: 'id', description: 'ID de la ficha técnica (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Ficha técnica actualizada exitosamente',
    type: ProductSpec,
  })
  @ApiResponse({ status: 404, description: 'Ficha técnica no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'El código de la ficha técnica ya existe',
  })
  @ApiResponse({
    status: 404,
    description: 'Uno de los hilos relacionados no existe',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductSpecDto: UpdateProductSpecDto,
  ): Promise<ProductSpec> {
    return this.productSpecsService.update(id, updateProductSpecDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una ficha técnica' })
  @ApiParam({ name: 'id', description: 'ID de la ficha técnica (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'Ficha técnica eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Ficha técnica no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productSpecsService.remove(id);
  }
}
