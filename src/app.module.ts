import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from './lib/auth'

@Module({
  imports: [AuthModule.forRoot({ auth })],
  controllers: [
    AppController,
    UsersController
  ],
  providers: [
    PrismaService,
    UsersService
  ],
})
export class AppModule { }
