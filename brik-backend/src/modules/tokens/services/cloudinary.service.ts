import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.logger.log('Cloudinary configured successfully');
  }

  /**
   * Upload image buffer to Cloudinary
   * @param file - Express.Multer.File object
   * @param folder - Cloudinary folder name (default: 'tokens')
   * @returns Cloudinary upload result with secure URL
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'tokens',
  ): Promise<string> {
    try {
      this.logger.debug(`Uploading image to Cloudinary folder: ${folder}`);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            format: 'png',
            transformation: [{ width: 200, height: 200, crop: 'limit' }],
          },
          (error, result) => {
            if (error) {
              this.logger.error(
                `Cloudinary upload error: ${error.message}`,
                error.stack,
              );
              reject(
                new BadRequestException(
                  `Failed to upload image: ${error.message}`,
                ),
              );
            } else if (result) {
              this.logger.log(`Image uploaded successfully: ${result.secure_url}`);
              resolve(result.secure_url);
            } else {
              reject(new BadRequestException('Upload failed: No result returned'));
            }
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error(
        `Error uploading image to Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete image from Cloudinary by public ID
   * @param publicId - Cloudinary public ID
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting image from Cloudinary: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted successfully: ${publicId}`);
    } catch (error) {
      this.logger.error(
        `Error deleting image from Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to delete image from Cloudinary');
    }
  }
}
