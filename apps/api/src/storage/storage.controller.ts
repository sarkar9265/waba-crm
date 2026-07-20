import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: { fileName: string, mimeType: string, clientId: string }) {
    // In production, clientId is derived from JWT
    const { fileName, mimeType, clientId } = body;
    
    // Prefix files with clientId to isolate tenant data
    const key = `${clientId}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    
    const result = await this.storageService.generatePresignedUploadUrl(key, mimeType);
    
    return {
      statusCode: HttpStatus.OK,
      data: result
    };
  }
}
