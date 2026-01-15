/**
 * Application Entry Point
 *
 * Configures and bootstraps the NestJS application
 * - CORS enabled for frontend integration
 * - Global validation pipes
 * - Environment-based configuration
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Don't throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert primitive types
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Explore API: http://localhost:${port}/api/explore`);
}

void bootstrap();
