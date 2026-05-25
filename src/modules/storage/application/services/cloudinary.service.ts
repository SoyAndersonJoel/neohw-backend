import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface IStorageService {
  uploadImage(file: Express.Multer.File, folder: string): Promise<string>;
  uploadDocument(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(publicId: string): Promise<void>;
}

@Injectable()
export class CloudinaryService implements IStorageService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary config is missing! Image uploads will fail.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    return this.uploadStream(file, folder, 'image');
  }

  async uploadDocument(file: Express.Multer.File, folder: string): Promise<string> {
    // Para PDFs o documentos, resource_type debe ser 'auto' o 'raw' dependiendo del caso,
    // pero 'auto' cubre tanto imágenes como PDFs en Cloudinary.
    return this.uploadStream(file, folder, 'auto');
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Failed to delete Cloudinary file: ${publicId}`, error);
    }
  }

  private uploadStream(file: Express.Multer.File, folder: string, resourceType: 'image' | 'auto' | 'raw' = 'auto'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result: UploadApiResponse) => {
          if (error) {
            return reject(new InternalServerErrorException('Error uploading file to Cloudinary'));
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
