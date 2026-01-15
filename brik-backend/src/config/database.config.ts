/**
 * Database Configuration
 *
 * Provides MongoDB configuration for the application
 */

import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI');

  if (!uri) {
    throw new Error('MONGODB_URI is not configured in environment variables');
  }

  return {
    uri,
    retryAttempts: 3,
    retryDelay: 1000,
  };
};
