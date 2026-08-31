import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "../prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  @ApiResponse({ status: 503, description: "Service is unhealthy" })
  async check() {
    try {
      // Verify database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
