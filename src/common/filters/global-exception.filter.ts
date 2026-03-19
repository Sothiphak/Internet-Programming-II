import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express'; // <-- Added explicit Express types

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // Explicitly tell TypeScript these are Express Requests and Responses
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // 1. Handle standard NestJS HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        // Safely typecast the object to avoid the "any" error
        const parsedBody = responseBody as { message?: string | string[] };
        message = parsedBody.message || 'Http Error';
      }
    }
    // 2. Catch ugly TypeORM / PostgreSQL Errors
    else if (exception instanceof Error) {
      // Safely check for Postgres error codes without using 'any'
      const dbError = exception as Error & { code?: string };
      if (dbError.code === '22P02' || exception.message.includes('uuid')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid UUID format provided in the URL';
      } else {
        message = exception.message;
      }
    }

    // Return the formatted response
    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
      error: message,
    });
  }
}
