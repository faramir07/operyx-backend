import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { Thread } from './entities/thread.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Thread, Supplier])],
  controllers: [ThreadsController],
  providers: [ThreadsService],
  exports: [ThreadsService],
})
export class ThreadsModule {}
