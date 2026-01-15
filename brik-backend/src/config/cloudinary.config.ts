import { ConfigService } from '@nestjs/config';

export const getCloudinaryConfig = (configService: ConfigService) => ({
  cloudName: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
  apiKey: configService.get<string>('CLOUDINARY_API_KEY'),
  apiSecret: configService.get<string>('CLOUDINARY_API_SECRET'),
});
