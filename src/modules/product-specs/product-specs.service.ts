import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSpec } from './entities/product-spec.entity';
import { Thread } from '../threads/entities/thread.entity';
import { CreateProductSpecDto } from './dto/create-product-spec.dto';
import { UpdateProductSpecDto } from './dto/update-product-spec.dto';
import { QueryProductSpecDto } from './dto/query-product-spec.dto';

@Injectable()
export class ProductSpecsService {
  constructor(
    @InjectRepository(ProductSpec)
    private readonly productSpecRepository: Repository<ProductSpec>,
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}

  async create(
    createProductSpecDto: CreateProductSpecDto,
  ): Promise<ProductSpec> {
    // Verificar si ya existe una ficha técnica con el mismo código
    const existingSpec = await this.productSpecRepository.findOne({
      where: { code: createProductSpecDto.code },
    });

    if (existingSpec) {
      throw new ConflictException(
        `Ya existe una ficha técnica con el código ${createProductSpecDto.code}`,
      );
    }

    // Validar existencia de threads relacionados si se proporcionan
    if (createProductSpecDto.elasticThreadId) {
      const threadCount = await this.threadRepository.count({
        where: { id: createProductSpecDto.elasticThreadId },
      });

      if (threadCount === 0) {
        throw new NotFoundException(
          `Hilo elástico con ID ${createProductSpecDto.elasticThreadId} no encontrado`,
        );
      }
    }

    if (createProductSpecDto.lycraThreadId) {
      const threadCount = await this.threadRepository.count({
        where: { id: createProductSpecDto.lycraThreadId },
      });

      if (threadCount === 0) {
        throw new NotFoundException(
          `Hilo lycra con ID ${createProductSpecDto.lycraThreadId} no encontrado`,
        );
      }
    }

    if (createProductSpecDto.baseThreadId) {
      const threadCount = await this.threadRepository.count({
        where: { id: createProductSpecDto.baseThreadId },
      });

      if (threadCount === 0) {
        throw new NotFoundException(
          `Hilo base con ID ${createProductSpecDto.baseThreadId} no encontrado`,
        );
      }
    }

    // Validar que los porcentajes sumen 100 (si se proporcionan)
    if (
      createProductSpecDto.elasticThreadPercentage !== undefined ||
      createProductSpecDto.lycraThreadPercentage !== undefined ||
      createProductSpecDto.baseThreadPercentage !== undefined
    ) {
      const elastic = createProductSpecDto.elasticThreadPercentage || 0;
      const lycra = createProductSpecDto.lycraThreadPercentage || 0;
      const base = createProductSpecDto.baseThreadPercentage || 0;
      const sum = elastic + lycra + base;

      // Permitir tolerancia de ±0.1
      if (Math.abs(sum - 100) > 0.1) {
        throw new BadRequestException(
          `Los porcentajes de material deben sumar 100. Suma actual: ${sum.toFixed(2)}%`,
        );
      }
    }

    const productSpec = this.productSpecRepository.create(createProductSpecDto);

    return await this.productSpecRepository.save(productSpec);
  }

  async findAll(queryDto: QueryProductSpecDto): Promise<{
    items: ProductSpec[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.productSpecRepository.createQueryBuilder('productSpec');

    // Aplicar filtros
    if (filters.code) {
      queryBuilder.andWhere('productSpec.code = :code', { code: filters.code });
    }
    if (filters.fileName) {
      queryBuilder.andWhere('productSpec.fileName = :fileName', {
        fileName: filters.fileName,
      });
    }
    if (filters.size) {
      queryBuilder.andWhere('productSpec.size = :size', { size: filters.size });
    }
    if (filters.elasticThreadId) {
      queryBuilder.andWhere('productSpec.elasticThreadId = :elasticThreadId', {
        elasticThreadId: filters.elasticThreadId,
      });
    }
    if (filters.lycraThreadId) {
      queryBuilder.andWhere('productSpec.lycraThreadId = :lycraThreadId', {
        lycraThreadId: filters.lycraThreadId,
      });
    }
    if (filters.baseThreadId) {
      queryBuilder.andWhere('productSpec.baseThreadId = :baseThreadId', {
        baseThreadId: filters.baseThreadId,
      });
    }

    // Búsqueda general
    if (search) {
      queryBuilder.andWhere(
        '(productSpec.code LIKE :search OR productSpec.fileName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('productSpec.createdAt', 'DESC')
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

  async findOne(id: string): Promise<ProductSpec> {
    const productSpec = await this.productSpecRepository.findOne({
      where: { id },
      relations: ['elasticThread', 'lycraThread', 'baseThread'],
    });

    if (!productSpec) {
      throw new NotFoundException(`Ficha técnica con ID ${id} no encontrada`);
    }

    return productSpec;
  }

  async update(
    id: string,
    updateProductSpecDto: UpdateProductSpecDto,
  ): Promise<ProductSpec> {
    const productSpec = await this.findOne(id);

    // Si se intenta actualizar el código, verificar que no exista otro con ese código
    if (
      updateProductSpecDto.code &&
      updateProductSpecDto.code !== productSpec.code
    ) {
      const existingSpec = await this.productSpecRepository.findOne({
        where: { code: updateProductSpecDto.code },
      });

      if (existingSpec) {
        throw new ConflictException(
          `Ya existe una ficha técnica con el código ${updateProductSpecDto.code}`,
        );
      }
    }

    // Validar existencia de threads relacionados si se proporcionan
    if (
      updateProductSpecDto.elasticThreadId !== undefined &&
      updateProductSpecDto.elasticThreadId !== null
    ) {
      const threadCount = await this.threadRepository.count({
        where: { id: updateProductSpecDto.elasticThreadId },
      });

      if (threadCount === 0) {
        throw new NotFoundException(
          `Hilo elástico con ID ${updateProductSpecDto.elasticThreadId} no encontrado`,
        );
      }
    }

    if (
      updateProductSpecDto.lycraThreadId !== undefined &&
      updateProductSpecDto.lycraThreadId !== null
    ) {
      const threadCount = await this.threadRepository.count({
        where: { id: updateProductSpecDto.lycraThreadId },
      });

      if (threadCount === 0) {
        throw new NotFoundException(
          `Hilo lycra con ID ${updateProductSpecDto.lycraThreadId} no encontrado`,
        );
      }
    }

    if (
      updateProductSpecDto.baseThreadId !== undefined &&
      updateProductSpecDto.baseThreadId !== null
    ) {
      const threadCount = await this.threadRepository.count({
        where: { id: updateProductSpecDto.baseThreadId },
      });

      if (threadCount === 0) {
        throw new NotFoundException(
          `Hilo base con ID ${updateProductSpecDto.baseThreadId} no encontrado`,
        );
      }
    }

    // Validar que los porcentajes sumen 100 (si se actualizan)
    if (
      updateProductSpecDto.elasticThreadPercentage !== undefined ||
      updateProductSpecDto.lycraThreadPercentage !== undefined ||
      updateProductSpecDto.baseThreadPercentage !== undefined
    ) {
      const elastic =
        updateProductSpecDto.elasticThreadPercentage ??
        productSpec.elasticThreadPercentage ??
        0;
      const lycra =
        updateProductSpecDto.lycraThreadPercentage ??
        productSpec.lycraThreadPercentage ??
        0;
      const base =
        updateProductSpecDto.baseThreadPercentage ??
        productSpec.baseThreadPercentage ??
        0;
      const sum = elastic + lycra + base;

      // Permitir tolerancia de ±0.1
      if (Math.abs(sum - 100) > 0.1) {
        throw new BadRequestException(
          `Los porcentajes de material deben sumar 100. Suma actual: ${sum.toFixed(2)}%`,
        );
      }
    }

    Object.assign(productSpec, updateProductSpecDto);
    return await this.productSpecRepository.save(productSpec);
  }

  async remove(id: string): Promise<ProductSpec> {
    const productSpec = await this.findOne(id);
    await this.productSpecRepository.remove(productSpec);
    return productSpec;
  }
}
