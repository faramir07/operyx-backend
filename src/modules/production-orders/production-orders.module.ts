import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrdersService } from './production-orders.service';
import { ProductionOrdersController } from './production-orders.controller';
import { ProductionOrder } from './entities/production-order.entity';
import { PartialWeight } from './entities/partial-weight.entity';
import { ProductSpec } from '../product-specs/entities/product-spec.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Thread } from '../threads/entities/thread.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      PartialWeight,
      ProductSpec,
      Machine,
      Thread,
    ]),
  ],
  controllers: [ProductionOrdersController],
  providers: [ProductionOrdersService],
  exports: [ProductionOrdersService], // Exportar el servicio si otros módulos lo necesitan
})
export class ProductionOrdersModule {}
