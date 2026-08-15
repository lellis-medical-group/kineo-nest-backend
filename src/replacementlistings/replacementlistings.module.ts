import { Module } from '@nestjs/common';
import { ReplacementlistingsService } from './replacementlistings.service';
import { ReplacementlistingsController } from './replacementlistings.controller';

@Module({
  controllers: [ReplacementlistingsController],
  providers: [ReplacementlistingsService],
})
export class ReplacementlistingsModule {}
