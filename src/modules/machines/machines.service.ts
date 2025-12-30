import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachineDto } from './dto/query-machine.dto';
import { Size } from '../product-specs/enums/size.enum';
import { MachineStatus } from './enums/machine-status.enum';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private readonly machineRepository: Repository<Machine>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    // Verificar si ya existe una máquina con el mismo código
    const existingMachine = await this.machineRepository.findOne({
      where: { code: createMachineDto.code },
    });

    if (existingMachine) {
      throw new ConflictException(
        `Ya existe una máquina con el código ${createMachineDto.code}`,
      );
    }

    // Validar que los valores de sizes sean únicos
    const uniqueSizes = [...new Set(createMachineDto.sizes)];
    if (uniqueSizes.length !== createMachineDto.sizes.length) {
      throw new BadRequestException('Las tallas no pueden estar duplicadas');
    }

    // Validar que todos los valores de sizes sean válidos
    const validSizes = Object.values(Size);
    const invalidSizes = createMachineDto.sizes.filter(
      (size) => !validSizes.includes(size),
    );
    if (invalidSizes.length > 0) {
      throw new BadRequestException(
        `Tallas inválidas: ${invalidSizes.join(', ')}`,
      );
    }

    const machineData: Partial<Machine> = {
      ...createMachineDto,
      workingHours: createMachineDto.workingHours || 0,
      status: createMachineDto.status || MachineStatus.OPERATIVE,
      sizes: createMachineDto.sizes.join(','), // Convertir array a string para simple-array
    };

    const machine = this.machineRepository.create(machineData);
    const savedMachine = await this.machineRepository.save(machine);

    // Convertir sizes de string a array para la respuesta
    // TypeORM simple-array almacena como string pero la entidad lo tipa como string[]
    const sizesArray =
      savedMachine.sizes && typeof savedMachine.sizes === 'string'
        ? savedMachine.sizes.split(',')
        : [];

    return {
      ...savedMachine,
      sizes: sizesArray,
    } as unknown as Machine;
  }

  async findAll(queryDto: QueryMachineDto): Promise<{
    items: Machine[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, sizes, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.machineRepository.createQueryBuilder('machine');

    // Aplicar filtros
    if (filters.code) {
      queryBuilder.andWhere('machine.code = :code', { code: filters.code });
    }
    if (filters.name) {
      queryBuilder.andWhere('machine.name = :name', { name: filters.name });
    }
    if (filters.status) {
      queryBuilder.andWhere('machine.status = :status', {
        status: filters.status,
      });
    }
    if (filters.needleCount) {
      queryBuilder.andWhere('machine.needleCount = :needleCount', {
        needleCount: filters.needleCount,
      });
    }
    if (filters.colorCount) {
      queryBuilder.andWhere('machine.colorCount = :colorCount', {
        colorCount: filters.colorCount,
      });
    }

    // Filtrar por tallas (si el array de sizes contiene alguna de las tallas de la máquina)
    if (sizes && sizes.length > 0) {
      const sizeConditions = sizes.map((_size, index) => {
        return `machine.sizes LIKE :size${index}`;
      });
      queryBuilder.andWhere(`(${sizeConditions.join(' OR ')})`, {
        ...sizes.reduce(
          (acc, size, index) => {
            acc[`size${index}`] = `%${size}%`;
            return acc;
          },
          {} as Record<string, string>,
        ),
      });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(machine.code LIKE :search OR machine.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('machine.createdAt', 'DESC')
      .getManyAndCount();

    // Convertir sizes de string a array para cada máquina
    const machinesWithArraySizes = items.map((machine) => {
      const sizesArray = machine.sizes ? machine.sizes.split(',') : [];
      return {
        ...machine,
        sizes: sizesArray,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: machinesWithArraySizes as unknown as Machine[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Machine> {
    const machine = await this.machineRepository.findOne({ where: { id } });

    if (!machine) {
      throw new NotFoundException(`Máquina con ID ${id} no encontrada`);
    }

    // Convertir sizes de string a array (TypeORM simple-array devuelve string)
    const sizesArray = machine.sizes ? machine.sizes.split(',') : [];

    return {
      ...machine,
      sizes: sizesArray,
    } as unknown as Machine;
  }

  async update(
    id: string,
    updateMachineDto: UpdateMachineDto,
  ): Promise<Machine> {
    const machine = await this.findOne(id);

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (updateMachineDto.code && updateMachineDto.code !== machine.code) {
      const existingMachine = await this.machineRepository.findOne({
        where: { code: updateMachineDto.code },
      });

      if (existingMachine) {
        throw new ConflictException(
          `Ya existe una máquina con el código ${updateMachineDto.code}`,
        );
      }
    }

    // Preparar datos para actualizar (excluir sizes del spread inicial)
    const { sizes: updateSizes, ...restUpdateData } = updateMachineDto;
    const updateData: Partial<Machine> = { ...restUpdateData };

    // Si se actualizan las tallas, validar
    if (updateSizes) {
      // Validar que los valores de sizes sean únicos
      const uniqueSizes = [...new Set(updateSizes)];
      if (uniqueSizes.length !== updateSizes.length) {
        throw new BadRequestException('Las tallas no pueden estar duplicadas');
      }

      // Validar que todos los valores de sizes sean válidos
      const validSizes = Object.values(Size);
      const invalidSizes = updateSizes.filter(
        (size) => !validSizes.includes(size),
      );
      if (invalidSizes.length > 0) {
        throw new BadRequestException(
          `Tallas inválidas: ${invalidSizes.join(', ')}`,
        );
      }

      // Convertir array a string para almacenar
      updateData.sizes = updateSizes.join(',');
    }

    Object.assign(machine, updateData);
    const updatedMachine = await this.machineRepository.save(machine);

    // Convertir sizes de string a array (TypeORM simple-array devuelve string)
    const sizesArray = updatedMachine.sizes
      ? updatedMachine.sizes.split(',')
      : [];

    return {
      ...updatedMachine,
      sizes: sizesArray,
    } as unknown as Machine;
  }

  async remove(id: string): Promise<Machine> {
    const machine = await this.findOne(id);
    await this.machineRepository.remove(machine);
    return machine;
  }
}
