// src/common/http-exception.filter.ts
import {
  type ArgumentsHost,
  Catch,
  HttpException,
  Logger,
} from "@nestjs/common";
import { BaseExceptionFilter, HttpAdapterHost } from "@nestjs/core";
import { ZodSerializationException } from "nestjs-zod";
import { ZodError } from "zod";

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === "production";

  constructor(httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
      }
    }


    if (this.isProduction) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      this.logger.error(
        `HTTP ${status} on ${request?.method} ${request?.url}: ${exception.message}`,
      );

      const sanitizedResponse = {
        statusCode: status,
        message: status >= 500 ? "Internal server error" : exception.message,
        path: request?.url,
        timestamp: new Date().toISOString(),
      };

      return response.status(status).json(sanitizedResponse);
    }

    super.catch(exception, host);
  }
}
