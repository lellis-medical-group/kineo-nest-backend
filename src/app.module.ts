import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from './lib/auth'
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ProfileModule } from './profile/profile.module';
import configuration from "./config/configuration";
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { PracticesModule } from './practices/practices.module';
import { ReplacementlistingsModule } from './replacementlistings/replacementlistings.module';
import { ApplicationsModule } from './applications/applications.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from "./common/guards/throttler-behind-proxy.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          { name: 'short', ttl: config.get<number>('throttle.short.ttl', 1000), limit: config.get<number>('throttle.short.limit', 5) },
          { name: 'medium', ttl: config.get<number>('throttle.medium.ttl', 10000), limit: config.get<number>('throttle.medium.limit', 30) },
          { name: 'long', ttl: config.get<number>('throttle.long.ttl', 60000), limit: config.get<number>('throttle.long.limit', 150) },
        ],
      }),
    }),
    AuthModule.forRoot({ auth }),
    UsersModule,
    ProfileModule,
    PracticesModule,
    ReplacementlistingsModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
  ],
})
export class AppModule { }