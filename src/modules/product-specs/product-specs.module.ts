import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSpecsService } from './product-specs.service';
import { ProductSpecsController } from './product-specs.controller';
import { ProductSpec } from './entities/product-spec.entity';
import { Thread } from '../threads/entities/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSpec, Thread])],
  controllers: [ProductSpecsController],
  providers: [ProductSpecsService],
  exports: [ProductSpecsService], // Exportar el servicio para que otros módulos lo puedan usar
})
export class ProductSpecsModule {}
