import { Module } from "@nestjs/common";
import { ReplacementlistingsController } from "./replacementlistings.controller";
import { ReplacementlistingsService } from "./replacementlistings.service";

@Module({
  controllers: [ReplacementlistingsController],
  providers: [ReplacementlistingsService],
})
export class ReplacementlistingsModule {}
