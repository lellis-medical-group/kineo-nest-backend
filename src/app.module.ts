import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from './lib/auth'
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule.forRoot({ auth }), UsersModule],
  controllers: [
    AppController,
  ],
  providers: [
    PrismaService,
  ],
})
export class AppModule { }
