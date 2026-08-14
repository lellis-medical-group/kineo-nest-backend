import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags('App')
@Controller()
export class AppController {

  @AllowAnonymous()
  @Get()
  @ApiOperation({ summary: 'Get API welcome message' })
  getRoot() {
    return {
      message: "hello",
    };
  }

  @AllowAnonymous()
  @Get("ping")
  @ApiOperation({ summary: 'Health check endpoint' })
  ping() {
    return "pong";
  }
}