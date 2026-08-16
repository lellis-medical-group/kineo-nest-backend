import { Module } from '@nestjs/common';
import { ReplacementlistingsService } from './replacementlistings.service';
import { ReplacementlistingsController } from './replacementlistings.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ReplacementlistingsController],
  providers: [ReplacementlistingsService, PrismaService],
})
export class ReplacementlistingsModule {}
