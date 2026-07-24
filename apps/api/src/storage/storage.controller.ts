import { Controller, Get, Post, Delete, Param, Query, UseInterceptors, UploadedFile, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaType } from '@algo-matrix/database';

@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const clientId = req.user.clientId;
    const url = await this.storageService.saveFile(file, clientId);

    return {
      statusCode: HttpStatus.OK,
      data: {
        url,
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      }
    };
  }

  @Get()
  async getMedia(
    @Req() req: any,
    @Query('type') type?: string,
  ) {
    const clientId = req.user.clientId;
    const mediaType = type ? (type.toUpperCase() as MediaType) : undefined;
    return this.storageService.getMedia(clientId, mediaType);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string, @Req() req: any) {
    const clientId = req.user.clientId;
    return this.storageService.deleteMedia(id, clientId);
  }
}
