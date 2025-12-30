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
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachineDto } from './dto/query-machine.dto';
import { Machine } from './entities/machine.entity';

@ApiTags('machines')
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva máquina',
    description:
      'Crea un nuevo registro de máquina con sus características (número de agujas, colores, tallas, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Máquina creada exitosamente',
    type: Machine,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o tallas duplicadas/inválidas',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una máquina con el código proporcionado',
  })
  create(@Body() createMachineDto: CreateMachineDto): Promise<Machine> {
    return this.machinesService.create(createMachineDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar máquinas',
    description:
      'Obtiene una lista paginada de máquinas con filtros opcionales (código, nombre, estado, agujas, colores, tallas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de máquinas obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Machine' },
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
  findAll(@Query() queryDto: QueryMachineDto) {
    return this.machinesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una máquina por ID',
    description: 'Obtiene los detalles completos de una máquina específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la máquina (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Máquina encontrada exitosamente',
    type: Machine,
  })
  @ApiResponse({
    status: 404,
    description: 'Máquina no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Machine> {
    return this.machinesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una máquina',
    description:
      'Actualiza los datos de una máquina existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la máquina (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Máquina actualizada exitosamente',
    type: Machine,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o tallas duplicadas/inválidas',
  })
  @ApiResponse({
    status: 404,
    description: 'Máquina no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra máquina con el código proporcionado',
  })
  update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
  ): Promise<Machine> {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una máquina',
    description: 'Elimina permanentemente una máquina del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la máquina (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Máquina eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Máquina no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.machinesService.remove(id);
  }
}
