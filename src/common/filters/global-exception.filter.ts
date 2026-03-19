import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch() // Leaving this empty tells NestJS to catch EVERY type of error
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Default to 500 Internal Server Error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // 1. Handle standard NestJS HTTP Exceptions (like your 400 Validation errors)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = typeof responseBody === 'string' ? responseBody : (responseBody as any).message || responseBody;
    } 
    // 2. Catch ugly TypeORM / PostgreSQL Errors
    else if (exception instanceof Error) {
      // Postgres throws code '22P02' for invalid UUID syntax
      if ((exception as any).code === '22P02' || exception.message.includes('uuid')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid UUID format provided in the URL';
      } else {
        // For development, we'll log the raw error message. In production, you'd hide this!
        message = exception.message; 
      }
    }

    // Return a standardized, professional JSON response
    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
      error: message,
    });
  }
}