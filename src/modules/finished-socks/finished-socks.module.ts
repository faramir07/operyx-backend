import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishedSocksService } from './finished-socks.service';
import { FinishedSocksController } from './finished-socks.controller';
import { FinishedSock } from './entities/finished-sock.entity';
import { FinishedSockMovement } from './entities/finished-sock-movement.entity';
import { ProductSpec } from '../product-specs/entities/product-spec.entity';
import { ProductionOrder } from '../production-orders/entities/production-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinishedSock,
      FinishedSockMovement,
      ProductSpec,
      ProductionOrder,
    ]),
  ],
  controllers: [FinishedSocksController],
  providers: [FinishedSocksService],
  exports: [FinishedSocksService], // Exportar el servicio para que otros módulos lo puedan usar
})
export class FinishedSocksModule {}
