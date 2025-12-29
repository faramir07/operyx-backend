import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Verificar si ya existe un proveedor con el mismo nombre
    const existingByName = await this.supplierRepository.findOne({
      where: { name: createSupplierDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Ya existe un proveedor con el nombre ${createSupplierDto.name}`,
      );
    }

    // Si se proporciona código, verificar que no exista otro con ese código
    if (createSupplierDto.code) {
      const existingByCode = await this.supplierRepository.findOne({
        where: { code: createSupplierDto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          `Ya existe un proveedor con el código ${createSupplierDto.code}`,
        );
      }
    }

    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      isActive: createSupplierDto.isActive ?? true,
    });

    return await this.supplierRepository.save(supplier);
  }

  async findAll(queryDto: QuerySupplierDto): Promise<{
    items: Supplier[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    // Aplicar filtros
    if (filters.name) {
      queryBuilder.andWhere('supplier.name = :name', { name: filters.name });
    }
    if (filters.code) {
      queryBuilder.andWhere('supplier.code = :code', { code: filters.code });
    }
    if (filters.email) {
      queryBuilder.andWhere('supplier.email = :email', {
        email: filters.email,
      });
    }
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('supplier.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(supplier.name LIKE :search OR supplier.code LIKE :search OR supplier.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('supplier.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return supplier;
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);

    // Si se intenta actualizar el nombre, verificar que no exista otro con ese nombre
    if (updateSupplierDto.name && updateSupplierDto.name !== supplier.name) {
      const existingByName = await this.supplierRepository.findOne({
        where: { name: updateSupplierDto.name },
      });

      if (existingByName) {
        throw new ConflictException(
          `Ya existe un proveedor con el nombre ${updateSupplierDto.name}`,
        );
      }
    }

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (updateSupplierDto.code && updateSupplierDto.code !== supplier.code) {
      const existingByCode = await this.supplierRepository.findOne({
        where: { code: updateSupplierDto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          `Ya existe un proveedor con el código ${updateSupplierDto.code}`,
        );
      }
    }

    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.remove(supplier);
    return supplier;
  }
}
