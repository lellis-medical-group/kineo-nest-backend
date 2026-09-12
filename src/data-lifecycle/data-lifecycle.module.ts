import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma.module";
import { DataLifecycleService } from "./data-lifecycle.service";

@Module({
  imports: [PrismaModule],
  providers: [DataLifecycleService],
})
export class DataLifecycleModule {}
