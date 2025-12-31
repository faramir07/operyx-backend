import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartonsService } from './cartons.service';
import { BagsService } from './bags.service';
import { HooksService } from './hooks.service';
import { CartonsController } from './cartons.controller';
import { BagsController } from './bags.controller';
import { HooksController } from './hooks.controller';
import { Carton } from './entities/carton.entity';
import { CartonMovement } from './entities/carton-movement.entity';
import { Bag } from './entities/bag.entity';
import { BagMovement } from './entities/bag-movement.entity';
import { Hook } from './entities/hook.entity';
import { HookMovement } from './entities/hook-movement.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Carton,
      CartonMovement,
      Bag,
      BagMovement,
      Hook,
      HookMovement,
      Supplier,
    ]),
  ],
  controllers: [CartonsController, BagsController, HooksController],
  providers: [CartonsService, BagsService, HooksService],
  exports: [CartonsService, BagsService, HooksService], // Exportar los servicios si otros módulos los necesitan
})
export class PackagingModule {}
