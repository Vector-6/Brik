/**
 * Vercel Serverless Entry Point
 *
 * This file exports the NestJS application as a serverless function for Vercel.
 * It uses a cached instance to avoid re-initialization on every request (cold start optimization).
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import { AppModule } from '../src/app.module';

let cachedApp: Express;

async function createApp(): Promise<Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
  });

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
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  cachedApp = expressApp;
  return expressApp;
}

// Export for Vercel
export default async (req: any, res: any) => {
  const app = await createApp();
  app(req, res);
};
