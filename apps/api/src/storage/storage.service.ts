import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME || 'waba-media-bucket';
    
    // Configured to support AWS S3 or Cloudflare R2 (via endpoint)
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    });
  }

  /**
   * Uploads a buffer directly to S3/R2 (useful for backend downloads from Meta API)
   */
  async uploadBuffer(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully uploaded ${key} to ${this.bucketName}`);
      
      // If bucket is public, return public URL. Otherwise, return the key.
      return `${process.env.AWS_ENDPOINT}/${this.bucketName}/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload ${key}`, error);
      throw new HttpException('Storage upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates a presigned URL so the Next.js client can upload files directly to S3/R2
   * without routing the file through the Node.js backend.
   */
  async generatePresignedUploadUrl(key: string, mimeType: string, expiresInSeconds = 3600): Promise<{ url: string, key: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimeType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
      
      return { url, key };
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}`, error);
      throw new HttpException('Failed to generate upload link', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates a presigned URL to view/download a private file.
   */
  async generatePresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } catch (error) {
      this.logger.error(`Failed to generate download URL for ${key}`, error);
      throw new HttpException('Failed to generate download link', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
