import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Apply Global Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Use the environment port or 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

// Fix the "Floating Promise" error by catching potential errors
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
