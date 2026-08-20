import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@ApiTags("App")
@Controller()
export class AppController {
  @AllowAnonymous()
  @Get()
  @ApiOperation({ summary: "Get API welcome message" })
  getRoot() {
    return {
      message: "hello",
    };
  }

  @AllowAnonymous()
  @Get("ping")
  @ApiOperation({ summary: "Health check endpoint" })
  ping() {
    return "pong";
  }
}
