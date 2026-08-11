import { Module } from '@nestjs/common';
import { PracticesService } from './practices.service';
import { PracticesController } from './practices.controller';

@Module({
  controllers: [PracticesController],
  providers: [PracticesService],
})
export class PracticesModule {}
