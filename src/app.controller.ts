import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: "hello from create-prisma + nest",
    };
  }

  @AllowAnonymous()
  @Get("ping")
  ping() {
    return "pong";
  }
}