import { Module } from '@nestjs/common';
import { PracticesService } from './practices.service';
import { PracticesController } from './practices.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PracticesController],
  providers: [PracticesService, PrismaService],
})
export class PracticesModule {}
