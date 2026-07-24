import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType, StorageProvider } from '@algo-matrix/database';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';

// ---------------------------------------------------------------------------
// Storage Provider Interface
// ---------------------------------------------------------------------------
interface IStorageProvider {
  upload(file: Express.Multer.File, clientId: string, filename: string): Promise<string>;
  delete(url: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Local Storage Provider
// ---------------------------------------------------------------------------
class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, clientId: string, filename: string): Promise<string> {
    const tenantDir = path.join(this.uploadDir, clientId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const filePath = path.join(tenantDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`Saved ${filename} locally for client ${clientId}`);

    return `/uploads/${clientId}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    // url is like /uploads/clientId/filename
    const filePath = path.join(process.cwd(), url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`Deleted local file: ${filePath}`);
    }
  }
}

// ---------------------------------------------------------------------------
// AWS S3 Storage Provider
// ---------------------------------------------------------------------------
class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async upload(file: Express.Multer.File, clientId: string, filename: string): Promise<string> {
    const key = `${clientId}/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
    this.logger.log(`Uploaded ${key} to S3`);
    return url;
  }

  async delete(url: string): Promise<void> {
    const key = url.replace(`https://${this.bucket}.s3.amazonaws.com/`, '');
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Deleted S3 object: ${key}`);
  }
}

// ---------------------------------------------------------------------------
// Cloudinary Storage Provider
// ---------------------------------------------------------------------------
class CloudinaryStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });
  }

  async upload(file: Express.Multer.File, clientId: string, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const resourceType = this.getResourceType(file.mimetype);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: clientId,
          public_id: filename.replace(/\.[^/.]+$/, ''), // strip extension
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(error);
          }
          this.logger.log(`Uploaded to Cloudinary: ${result!.secure_url}`);
          resolve(result!.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async delete(url: string): Promise<void> {
    // Extract public_id from the cloudinary URL
    const parts = url.split('/upload/');
    if (parts.length < 2) return;
    const publicId = parts[1].replace(/\.[^/.]+$/, ''); // strip extension
    await cloudinary.uploader.destroy(publicId);
    this.logger.log(`Deleted Cloudinary asset: ${publicId}`);
  }

  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }
}

// ---------------------------------------------------------------------------
// Main Storage Service
// ---------------------------------------------------------------------------
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: IStorageProvider;
  private readonly activeProvider: StorageProvider;

  constructor(private readonly prisma: PrismaService) {
    const configuredProvider = (process.env.STORAGE_PROVIDER || 'LOCAL').toUpperCase();

    if (configuredProvider === 'S3' && process.env.AWS_S3_BUCKET) {
      this.provider = new S3StorageProvider();
      this.activeProvider = StorageProvider.S3;
      this.logger.log('Using AWS S3 storage provider');
    } else if (configuredProvider === 'CLOUDINARY' && process.env.CLOUDINARY_CLOUD_NAME) {
      this.provider = new CloudinaryStorageProvider();
      this.activeProvider = StorageProvider.CLOUDINARY;
      this.logger.log('Using Cloudinary storage provider');
    } else {
      this.provider = new LocalStorageProvider();
      this.activeProvider = StorageProvider.LOCAL;
      this.logger.log('Using Local storage provider');
    }
  }

  /**
   * Saves an uploaded file using the configured provider and records it in the database.
   */
  async saveFile(file: Express.Multer.File, clientId: string): Promise<string> {
    try {
      const filename = `${Date.now()}-${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;
      const url = await this.provider.upload(file, clientId, filename);

      await this.prisma.media.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          type: this.resolveMediaType(file.mimetype),
          provider: this.activeProvider,
          url,
          clientId,
        },
      });

      return url;
    } catch (error: any) {
      this.logger.error(`Failed to save file for client ${clientId}`, error);
      throw new HttpException('Storage upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Saves a buffer to local disk (useful for backend downloads from Meta API).
   * This always uses local storage regardless of provider config.
   */
  async uploadBuffer(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, key);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
      this.logger.log(`Saved buffer to ${key}`);

      return `/uploads/${key}`;
    } catch (error: any) {
      this.logger.error(`Failed to save buffer ${key}`, error);
      throw new HttpException('Storage buffer upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Returns all media records for a client, with optional type filtering.
   */
  async getMedia(clientId: string, type?: MediaType) {
    return this.prisma.media.findMany({
      where: {
        clientId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deletes a media record and its backing file from the storage provider.
   */
  async deleteMedia(mediaId: string, clientId: string) {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, clientId },
    });

    if (!media) {
      throw new HttpException('Media not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.provider.delete(media.url);
    } catch (err: any) {
      this.logger.warn(`Could not delete backing file for media ${mediaId}: ${err.message}`);
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private resolveMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/ogg') || mimeType === 'audio/opus') return MediaType.VOICE;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }
}
