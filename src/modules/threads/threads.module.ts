import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { Thread } from './entities/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Thread])],
  controllers: [ThreadsController],
  providers: [ThreadsService],
  exports: [ThreadsService],
})
export class ThreadsModule {}
