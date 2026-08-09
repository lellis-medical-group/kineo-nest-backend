import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from './lib/auth'
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { ProfileModule } from './profile/profile.module';
import configuration from "./config/configuration";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), AuthModule.forRoot({ auth }), UsersModule, ProfileModule],
  controllers: [
    AppController,
  ],
  providers: [
    PrismaService,
  ],
})
export class AppModule { }
